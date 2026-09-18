import { readFile } from "node:fs/promises";
import { transform } from "@astrojs/compiler";
import { compile } from "svelte/compiler";

const root = new URL("../", import.meta.url);
const astroPath = new URL("dist/astro/SafeArea.astro", root);
const sveltePath = new URL("dist/svelte/SafeArea.svelte", root);
const [astroSource, svelteSource] = await Promise.all([
  readFile(astroPath, "utf8"),
  readFile(sveltePath, "utf8")
]);

const astro = await transform(astroSource, {
  filename: astroPath.pathname,
  sourcemap: false
});
if (!astro.code.includes("createComponent")) {
  throw new Error("Astro adapter did not compile to a component.");
}

const svelte = compile(svelteSource, {
  filename: sveltePath.pathname,
  generate: "client",
  modernAst: true
});
if (!svelte.js.code) {
  throw new Error("Svelte adapter did not produce JavaScript.");
}

console.log("Astro and Svelte source adapters compiled successfully.");
