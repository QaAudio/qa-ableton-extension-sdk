/**
 * Bundles the extension into a single CommonJS file Live can load.
 *
 * Live does not resolve node_modules at runtime — everything must be inlined here.
 * We import HTML and CSS as text so the webview panel ships inside dist/extension.js.
 */
import * as esbuild from "esbuild";
import * as fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8")) as { entry: string };
const production = process.argv.includes("--production");

await esbuild.build({
  entryPoints: ["src/extension.ts"],
  outfile: manifest.entry,
  bundle: true,
  format: "cjs",
  platform: "node",
  sourcesContent: false,
  logLevel: "info",
  minify: production,
  sourcemap: !production,
  loader: {
    ".html": "text",
    ".css": "text",
  },
});
