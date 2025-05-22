import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import semver from "semver";
import { exists, isDirectory, readPackageJson } from "../utils/fs";
import type { ScopeItem, ScopePackageJson } from "./types";
import { prompt } from "./ui";

type PackageManager = "npm" | "pnpm" | "yarn";

const LOCK_FILES: Record<PackageManager, string> = {
  pnpm: "pnpm-lock.yaml",
  npm: "package-lock.json",
  yarn: "yarn.lock",
};

export const installDependencies = async (item: ScopeItem, destination: string) => {
  const manager = identifyPackageManager(destination);
  if (!manager) {
    return null;
  }
  const itemPackage = item.package;
  if (!itemPackage) {
    return null;
  }
  const [pkgManager, pkgJson] = manager;

  const deps = compareDependencies(item.package?.dependencies, pkgJson.dependencies);
  const devDeps = compareDependencies(item.package?.devDependencies, pkgJson.devDependencies);

  const directory = isDirectory(destination) ? resolve(destination) : dirname(resolve(destination));

  const installCommand = makeInstallCommand(pkgManager, deps, devDeps);
  if (installCommand) {
    const answer = await prompt(`Installing dependencies.  The following command will be executed:

  Directory: ${directory}
  Command:  ${installCommand}

Continue? (Y/n)
`);
    if (answer.toLowerCase() !== "n") {
      spawnSync(installCommand, { shell: true, cwd: directory, stdio: "pipe" });
    }
  }
};

const makeInstallCommand = (
  pkgManager: PackageManager,
  packages: Record<string, string> | null,
  devPackages: Record<string, string> | null,
) => {
  if (!packages && !devPackages) {
    return null;
  }
  if (
    packages &&
    devPackages &&
    Object.keys(packages).length === 0 &&
    Object.keys(devPackages).length === 0
  ) {
    return null;
  }
  const subcmd = pkgManager === "yarn" ? "add" : "install";

  const cmds: string[] = [];
  if (packages && Object.keys(packages).length > 0) {
    const packagesWithVersion = Object.entries(packages).map(
      ([pkg, version]) => `${pkg}@${version}`,
    );
    cmds.push(`${pkgManager} ${subcmd} ${packagesWithVersion.join(" ")}`);
  }
  if (devPackages && Object.keys(devPackages).length > 0) {
    const packagesWithVersion = Object.entries(devPackages).map(
      ([pkg, version]) => `${pkg}@${version}`,
    );
    cmds.push(`${pkgManager} ${subcmd} -D ${packagesWithVersion.join(" ")}`);
  }
  return cmds.join(" && ");
};

export const identifyPackageManager = (
  destination: string,
): [PackageManager, ScopePackageJson] | null => {
  const findPackageJson = (path: string) => {
    const packageJsonPath = join(resolve(dirname(path)), "package.json");
    if (exists(packageJsonPath)) {
      return packageJsonPath;
    }
    const parentPath = join(resolve(path), "..");
    if (parentPath.split("/").length > 2) {
      return findPackageJson(parentPath);
    }
    return null;
  };

  const pkgPath = findPackageJson(destination);

  if (pkgPath) {
    const pkgContents = readPackageJson(pkgPath);

    if (pkgContents?.packageManager) {
      const pkgManager = pkgContents.packageManager.split("@").at(0) as PackageManager;
      return [pkgManager, pkgContents] as const;
    }

    const pkgDirPath = dirname(pkgPath);
    const pkgManager = Object.entries(LOCK_FILES)
      .find(([_, val]) => exists(join(pkgDirPath, val)))
      ?.at(0) as PackageManager | undefined;

    if (pkgContents && pkgManager) {
      return [pkgManager, pkgContents] as const;
    }

    if (!pkgManager && pkgPath.split("/").length > 2) {
      const monoRepo = identifyPackageManager(join(pkgDirPath, ".."));
      if (monoRepo && pkgContents) {
        const [pkgManager] = monoRepo;
        return [pkgManager, pkgContents];
      }
    }
  }

  return null;
};

const compareDependencies = (
  dependencies: Partial<Record<string, string>> | undefined,
  installedDependences: Partial<Record<string, string>> | undefined,
) => {
  if (!dependencies) {
    return null;
  }
  const dependenciesToBeInstalled: Record<string, string> = {};

  for (const [dependency, version] of Object.entries(dependencies)) {
    const actualVersion = version ? semver.minVersion(version)?.raw : null;
    if (!version || !actualVersion) {
      continue;
    }
    const alreadyInstalledVersion = installedDependences?.[dependency];
    if (alreadyInstalledVersion && semver.satisfies(actualVersion, alreadyInstalledVersion)) {
      continue;
    }
    dependenciesToBeInstalled[dependency] = version;
  }

  return dependenciesToBeInstalled;
};
