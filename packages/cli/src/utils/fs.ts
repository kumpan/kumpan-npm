import fs from "node:fs";
import { dirname, extname, normalize } from "node:path";

export const exists = (path: string) => fs.existsSync(path);
export const dirExists = (path: string) => fs.existsSync(dirname(path));

export const isDirectory = (path: string) => exists(path) && fs.lstatSync(path).isDirectory();

export const mkdirs = (path: string) => {
  const normalized = normalize(path);
  const trimmed = extname(normalized) ? dirname(normalized) : normalized;
  fs.mkdirSync(trimmed, { recursive: true });
};
