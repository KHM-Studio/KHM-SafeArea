import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const pkg = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
const required = [
  "dist/index.js",
  "dist/index.d.ts",
  "dist/auto.js",
  "dist/css/index.css",
  "dist/astro/SafeArea.astro",
  "dist/react/index.js",
  "dist/vue/index.js",
  "dist/svelte/SafeArea.svelte",
  "dist/element/index.js",
  "dist/element/auto.js"
];

await Promise.all(required.map((file) => access(new URL(file, root))));
assert.equal(pkg.type, "module");
assert.ok(pkg.sideEffects.includes("./dist/auto.js"));
assert.ok(pkg.sideEffects.includes("./dist/element/auto.js"));
assert.ok(pkg.peerDependenciesMeta.react.optional);

const core = await import(new URL("dist/index.js", root));
assert.equal(typeof core.createSafeArea, "function");
const ssrInstance = core.createSafeArea();
assert.equal(ssrInstance.getState().keyboard.open, false);
ssrInstance.start().refresh().stop();
const auto = await import(new URL("dist/auto.js", root));
assert.equal(auto.autoSafeArea, undefined);
const element = await import(new URL("dist/element/index.js", root));
assert.equal(typeof element.defineSafeAreaElement, "function");
assert.equal(element.defineSafeAreaElement(), false);

const bytes = (await Promise.all(required.map((file) => stat(new URL(file, root))))).reduce(
  (total, entry) => total + entry.size,
  0
);
console.log(`Package exports verified. Key files: ${(bytes / 1024).toFixed(1)} kB uncompressed.`);
