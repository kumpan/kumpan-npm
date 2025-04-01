import type { Scope } from "./types";

export const printAvailableItems = (scope: Scope) => {
  const itemNames = scope.items.map((item) => item.name);
  console.log(`Available ${scope.name}s`, itemNames);
};
