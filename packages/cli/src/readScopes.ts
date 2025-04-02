import fs from "node:fs";
import { join } from "node:path";
import { singular } from "pluralize";
import type { Scope, ScopePackageJson } from "./types";
import { printError } from "./ui";
import { exists } from "./utils/fs";

export const readScopes = (scopesDir: string): Scope[] => {
  return fs.readdirSync(scopesDir).map((scope) => {
    const scopePath = join(scopesDir, scope);
    const items = readScopeItems(scopePath);

    return {
      name: singular(scope),
      path: scopePath,
      items,
    };
  });
};

const readScopeItems = (scopePath: string) => {
  return fs
    .readdirSync(scopePath)
    .map((itemDir) => {
      const packageJsonPath = join(scopePath, itemDir, "package.json");

      if (!exists(packageJsonPath)) {
        return {
          name: itemDir,
          path: join(scopePath, itemDir),
        };
      }
      const pkg = readPackageJson(packageJsonPath);

      if (!pkg) {
        return null;
      }

      return {
        name: pkg.name,
        path: join(scopePath, itemDir),
        package: pkg,
      };
    })
    .filter((pkg) => pkg !== null);
};

const readPackageJson = (path: string) => {
  try {
    const filecontents = fs.readFileSync(path, "utf8");
    const pkg = JSON.parse(filecontents) as ScopePackageJson;

    if (!pkg.name) {
      printError(`package.json is missing name: ${path}`);
      return null;
    }
    return pkg;
  } catch (e) {
    if (e instanceof SyntaxError) {
      printError(`Invalid package.json: ${path}`);
    }
    return null;
  }
};
