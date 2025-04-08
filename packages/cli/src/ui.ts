import readline from "node:readline/promises";
import type { Scope } from "./types";
import { getRootDir } from "./utils/fs";

const { log, error, warn } = console;

export const printAvailableItems = (scope: Scope) => {
  const itemNames = scope.items.map((item) => item.name);
  log(`Available ${scope.name}s`, itemNames);
};

export const printAvailableScopes = (scopes: Scope[]) => {
  if (!scopes.length) {
    log("No available scopes");
  } else {
    log("Available scopes: ", scopes.map((s) => s.name).join(", "));
  }
};

export const printWarning = (...msgs: string[]) => {
  warn(`Warning: ${msgs.join(", ")}`);
};

export const printError = (...msgs: string[]) => {
  error(`Error: ${msgs.join(", ")}`);
};

export const printCompletionInstallInstructions = () => {
  log("Add this to your .zshrc and restart your terminal");
  log("");
  printCompletionRC();
  log("");
  log("Or run `kumpan completion --zshrc >> ~/.zshrc`");
};

export const printCompletionRC = () => {
  log("# kumpan-cli tab completion");
  log("[[ -f ~/.config/kumpan/completion.zsh ]] && . ~/.config/kumpan/completion.zsh || true");
};

export const printRoot = () => {
  log(getRootDir());
};

export const prompt = async (question = "") => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return rl.question(question).finally(() => rl.close());
};
