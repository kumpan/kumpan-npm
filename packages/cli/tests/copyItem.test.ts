import { dirname, extname, join, resolve } from "node:path";
import { fs, vol } from "memfs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { copyItem } from "../src/copyItem";
import type { ScopeItem } from "../src/types";

vi.mock("node:fs", () => {
  return Object.assign(fs, { default: fs });
});

const createSourceItem = (item: ScopeItem) => {
  const files = item.package?.files ? item.package.files : [item.name];
  for (const file of files) {
    const filepath = join(item.path, extname(item.path) ? "" : file);
    const dir = dirname(filepath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (extname(filepath)) {
      fs.writeFileSync(filepath, "");
    }
  }
};

describe("copyItem", () => {
  beforeEach(() => {
    vol.reset();
  });

  it("copies a single file", () => {
    const item = { name: "test.foo", path: "/source/test.foo" };
    createSourceItem(item);

    const targetPath = "/";
    copyItem(item, targetPath);

    expect(fs.existsSync("/test.foo")).toBe(true);
  });

  it("copies and renames a single file", () => {
    const item = { name: "test.foo", path: "/source/test.foo" };
    createSourceItem(item);

    const targetPath = "/target.bar";
    copyItem(item, targetPath);

    expect(fs.existsSync("/target.bar")).toBe(true);
  });

  it("copies a single file to a deeply nested directory", () => {
    const item = { name: "test.foo", path: "/test.foo" };
    createSourceItem(item);

    const targetPath = "/target/foo/test.bar";
    copyItem(item, targetPath);

    expect(fs.existsSync(targetPath)).toBe(true);
  });

  it("copies a single file to the current directory", () => {
    const item = { name: "test.foo", path: "/temp/deep/test.foo" };
    createSourceItem(item);

    copyItem(item, ".");

    expect(fs.existsSync(join(resolve("."), "test.foo"))).toBe(true);
  });

  it("copies files defined in the package.json from the source directory", () => {
    const item = { name: "test", path: "/test", package: { files: ["one.test", "two.test"] } };
    createSourceItem(item);

    const targetPath = "/target";

    copyItem(item, targetPath);

    expect(fs.existsSync(join(targetPath, item.name, "one.test"))).toBe(true);
    expect(fs.existsSync(join(targetPath, item.name, "two.test"))).toBe(true);
  });

  it("copies files in subdirectories defined in the package.json from the source directory", () => {
    const item = {
      name: "source",
      path: "/source",
      package: { files: ["one.test", "foo/two.test", "bar/three.test"] },
    };
    createSourceItem(item);

    const targetPath = "/target";

    copyItem(item, targetPath);

    expect(fs.existsSync(join(targetPath, item.name, "one.test"))).toBe(true);
    expect(fs.existsSync(join(targetPath, item.name, "foo", "two.test"))).toBe(true);
    expect(fs.existsSync(join(targetPath, item.name, "bar", "three.test"))).toBe(true);
  });

  it("copies all files in directories defined in package.json", () => {
    const item = {
      name: "source",
      path: "/source",
      package: { files: ["one.test", "foo"] },
    };
    createSourceItem(item);
    createSourceItem({ name: "two.test", path: "/source/foo/two.test" });
    createSourceItem({ name: "three.test", path: "/source/foo/three.test" });

    const targetPath = "/target";

    copyItem(item, targetPath);

    expect(fs.existsSync(join(targetPath, item.name, "one.test"))).toBe(true);
    expect(fs.existsSync(join(targetPath, item.name, "foo", "two.test"))).toBe(true);
    expect(fs.existsSync(join(targetPath, item.name, "foo", "three.test"))).toBe(true);
  });
});
