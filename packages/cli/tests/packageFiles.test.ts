import { join, resolve } from "node:path";
import { singular } from "pluralize";
import { describe, expect, test } from "vitest";
import { listPackageFiles } from "../src/lib/copyItem";
import { readScopes } from "../src/lib/readScopes";
import { exists } from "../src/utils/fs";

describe("files of items", () => {
  test("that each package file exists", () => {
    const scopes = readScopes(resolve("scopes"));

    for (const scope of scopes) {
      for (const item of scope.items) {
        const files = listPackageFiles(item);
        for (const file of files) {
          const filepath = join(item.path, file);

          expect(exists(filepath), `${singular(scope.name)} ${item.name} is missing ${file}`).toBe(
            true,
          );
        }
      }
    }
  });
});
