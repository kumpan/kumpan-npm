import fs from "node:fs";
import { dirname } from "node:path";

export const exists = (path: string) => fs.existsSync(path);
export const dirExists = (path: string) => fs.existsSync(dirname(path));

export const isDirectory = (path: string) => exists(path) && fs.lstatSync(path).isDirectory();

export const mkdirs = (path: string) => {
  fs.mkdirSync(dirname(path), { recursive: true });
};
