import * as esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/main.ts"],
    target: "node20.10.0",
    platform: "node",
    bundle: true,
    packages: "external",
    format: "cjs",
    outfile: "./bin/kumpan",
    tsconfig: "./tsconfig.build.json",
    allowOverwrite: true,
    treeShaking: true,
    minify: true,
  })
  .then(() => console.log("Bundling done!"))
  .catch(console.error);
