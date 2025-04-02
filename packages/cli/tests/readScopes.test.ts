import { extname, join } from "node:path";
import { fs, vol } from "memfs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readScopes } from "../src/readScopes";
import type { Scope } from "../src/types";
import { mkdirs } from "../src/utils/fs";

vi.mock("node:fs", () => {
  return Object.assign(fs, { default: fs });
});

const createScope = (scope: Scope) => {
  mkdirs(scope.path);
  for (const item of scope.items) {
    mkdirs(item.path);
    if (extname(item.path)) {
      fs.writeFileSync(item.path, "");
    }
    if (item.package) {
      fs.writeFileSync(join(item.path, "package.json"), JSON.stringify(item.package));
    }
  }
};

describe("readScopes", () => {
  beforeEach(() => {
    vol.reset();
  });

  it("reads an empty scope", () => {
    const scope = { name: "test", path: "/scopes/test", items: [] };

    createScope(scope);

    const scopes = readScopes("/scopes");

    expect(scopes).toContainMatchingObject(scope);
  });

  it("reads a scope with file items", () => {
    const scope = {
      name: "test",
      path: "/scopes/test",
      items: [{ name: "item.json", path: "/scopes/test/item.json" }],
    };

    createScope(scope);

    const scopes = readScopes("/scopes");

    expect(scopes).toContainMatchingObject(scope);
  });

  it("reads a scope with directory items", () => {
    const scope = {
      name: "test",
      path: "/scopes/test",
      items: [{ name: "dir-item", path: "/scopes/test/dir-item" }],
    };

    createScope(scope);

    const scopes = readScopes("/scopes");

    expect(scopes).toContainMatchingObject(scope);
  });

  it("reads a scope deeply nested", () => {
    const scope = {
      name: "test",
      path: "/scopes/deep/nested/test",
      items: [{ name: "dir-item", path: "/scopes/deep/nested/test/dir-item" }],
    };

    createScope(scope);

    const scopes = readScopes("/scopes/deep/nested");

    expect(scopes).toContainMatchingObject(scope);
  });

  it("reads a scope with a package item", () => {
    const scope = {
      name: "test",
      path: "/scopes/test",
      items: [
        {
          name: "test-package",
          path: "/scopes/test/package-item",
          package: { name: "test-package", files: [] },
        },
      ],
    };

    createScope(scope);

    const scopes = readScopes("/scopes");

    expect(scopes).toContainMatchingObject(scope);
  });

  it("reads a scope with a package item with files", () => {
    const scope = {
      name: "test",
      path: "/scopes/test",
      items: [
        {
          name: "test-package",
          path: "/scopes/test/package-item",
          package: { name: "test-package", files: ["foo.ts", "bar"] },
        },
      ],
    };

    createScope(scope);

    const scopes = readScopes("/scopes");

    expect(scopes).toContainMatchingObject(scope);
  });

  it("reads a scope with multiple different items", () => {
    const scope = {
      name: "test",
      path: "/scopes/test",
      items: [
        { name: "dir-item", path: "/scopes/test/dir-item" },
        { name: "item.json", path: "/scopes/test/item.json" },
        {
          name: "test-package",
          path: "/scopes/test/package-item",
          package: { name: "test-package", files: ["foo.ts", "bar"] },
        },
      ],
    };

    createScope(scope);

    const scopes = readScopes("/scopes");

    expect(scopes).toContainMatchingObject(scope);
  });
});
