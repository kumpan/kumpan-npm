import type { PackageJson } from "type-fest";

export type Scope = {
  name: string;
  path: string;
  items: ScopeItem[];
};

export type ScopePackageJson = PackageJson & { name: string };

export type ScopeItem = {
  name: string;
  path: string;
  package?: ScopePackageJson;
};
