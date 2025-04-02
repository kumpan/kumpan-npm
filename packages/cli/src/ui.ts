import type { Scope } from "./types";

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
