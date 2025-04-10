import fs from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import type { ScopeItem } from "./types";
import { printWarning } from "./ui";
import { dirExists, exists, isDirectory, mkdirs } from "./utils/fs";

export const copyItem = (item: ScopeItem, destination: string) => {
  if (!item.package) {
    return copySingleFile(item.path, destination);
  }

  const files = listItemFiles(item);
  const [firstFile] = files;

  if (files.length > 1) {
    const sourcePaths = files.map((file) => join(item.path, file));
    const targetPath = join(destination, item.name);
    copyMultipleFiles(item.path, sourcePaths, targetPath);
  } else if (firstFile) {
    const targetPath = join(item.path, firstFile);
    copySingleFile(targetPath, destination);
  } else {
    console.error("No files specified in package.json", item.name);
  }
};

export const listItemFiles = (item: ScopeItem) => {
  return (
    item.package?.files?.flatMap((entry) => {
      const entrypath = join(item.path, entry);

      if (isDirectory(entrypath)) {
        return fs.readdirSync(entrypath).map((file) => join(entry, file));
      }

      return entry;
    }) || []
  );
};

const copySingleFile = (path: string, destination: string) => {
  const shouldRename = !!extname(destination);

  const dest = join(resolve(destination), shouldRename ? "" : basename(path));

  if (exists(dest)) {
    printWarning("File already exists. Skipping", destination);
    return;
  }
  if (!dirExists(dest)) {
    mkdirs(dest);
  }
  fs.copyFileSync(path, dest);
};

const copyMultipleFiles = (root: string, paths: string[], destination: string) => {
  for (const sourceFile of paths) {
    const dest = join(resolve(destination), sourceFile.replace(root, ""));
    if (!dirExists(dest)) {
      mkdirs(dest);
    }
    if (exists(dest)) {
      console.warn("File already exists. Skipping", sourceFile);
      continue;
    }

    fs.copyFileSync(sourceFile, dest);
  }
};
