import { cp, mkdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dist = new URL("../dist/", import.meta.url);

await mkdir(dist, { recursive: true });
await Promise.all([
  cp(new URL("src/css", root), new URL("css", dist), { recursive: true }),
  cp(new URL("src/astro", root), new URL("astro", dist), { recursive: true }),
  cp(new URL("src/svelte", root), new URL("svelte", dist), { recursive: true })
]);
