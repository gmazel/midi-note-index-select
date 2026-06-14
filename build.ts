import * as esbuild from "esbuild";
import * as fs from "fs";

const production = process.argv.includes("--production");
const panelHtml = fs.readFileSync("src/ui/panel.html", "utf8");

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: "dist/index.js",
  minify: production,
  sourcemap: !production,
  define: {
    __PANEL_HTML__: JSON.stringify(panelHtml),
  },
});

console.log("Build complete.");
