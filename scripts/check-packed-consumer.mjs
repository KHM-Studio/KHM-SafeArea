import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("../", import.meta.url);
const temporary = await mkdtemp(join(tmpdir(), "khm-safearea-consumer-"));
const node = process.execPath;
const npmCli = process.env.npm_execpath;

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: false,
    windowsHide: true
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed:\n${result.stdout ?? ""}\n${result.stderr ?? ""}`
    );
  }
  return result.stdout.trim();
}

function runNpm(args, cwd) {
  if (!npmCli) throw new Error("npm_execpath is unavailable; run this check through npm scripts.");
  return run(node, [npmCli, ...args, "--cache", join(temporary, "npm-cache")], cwd);
}

try {
  const packOutput = runNpm(
    ["pack", "--ignore-scripts", "--json", "--pack-destination", temporary],
    root
  );
  const [packed] = JSON.parse(packOutput);
  if (!packed?.filename) throw new Error("npm pack did not return a filename.");
  const tarball = join(temporary, basename(packed.filename));

  await writeFile(
    join(temporary, "package.json"),
    JSON.stringify({ name: "khm-safearea-consumer-check", private: true, type: "module" }),
    "utf8"
  );
  runNpm(
    ["install", tarball, "--ignore-scripts", "--no-audit", "--no-fund", "--omit=peer", "--offline"],
    temporary
  );

  const verification = [
    'import { createSafeArea } from "@khm-studio/safearea";',
    'import auto from "@khm-studio/safearea/auto";',
    'import { defineSafeAreaElement } from "@khm-studio/safearea/element";',
    'if (typeof createSafeArea !== "function") throw new Error("Missing core export");',
    'if (auto !== undefined) throw new Error("SSR auto entry must be inert");',
    'if (defineSafeAreaElement() !== false) throw new Error("SSR element registration must be inert");',
    'console.log("Installed tarball imports passed");'
  ].join("\n");
  const consumerOutput = run(node, ["--input-type=module", "--eval", verification], temporary);
  const installedPackage = JSON.parse(
    await readFile(
      join(temporary, "node_modules", "@khm-studio", "safearea", "package.json"),
      "utf8"
    )
  );
  if (installedPackage.version !== packed.version) {
    throw new Error("Installed package version does not match the packed artifact.");
  }

  console.log(
    `${consumerOutput}. Tarball ${packed.filename}: ${(packed.size / 1024).toFixed(1)} kB compressed, ${(packed.unpackedSize / 1024).toFixed(1)} kB unpacked.`
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
