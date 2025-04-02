import * as esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    target: "node20.10.0",
    platform: "node",
    bundle: true,
    packages: "bundle",
    format: "cjs",
    outfile: "./bin/kumpan",
    tsconfig: "./tsconfig.build.json",
    allowOverwrite: true,
    treeShaking: true,
    minify: true,
  })
  .then(() => console.log("Bundling done!"))
  .catch(console.error);
