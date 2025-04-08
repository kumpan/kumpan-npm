import fs from "node:fs";
import os from "node:os";
import { dirname, extname, join, normalize, resolve } from "node:path";

export const exists = (path: string) => fs.existsSync(path);
export const dirExists = (path: string) => fs.existsSync(dirname(path));

export const isDirectory = (path: string) => exists(path) && fs.lstatSync(path).isDirectory();

export const mkdirs = (path: string) => {
  const normalized = normalize(path);
  const trimmed = extname(normalized) ? dirname(normalized) : normalized;
  fs.mkdirSync(trimmed, { recursive: true });
};

export const getRootDir = () => {
  const executablePath = process.argv[1];
  if (!executablePath) {
    throw new Error("Failed to infer executable path. Did you run the script with node?");
  }
  return join(resolve(dirname(executablePath)), "..");
};

export const getKumpanConfigDir = () => {
  const configDir = process.env.XDG_CONFIG_HOME || os.homedir();
  return join(configDir, ".config", "kumpan");
};
