import { Argument, Command } from "@commander-js/extra-typings";
import pluralize from "pluralize";
import type { Scope } from "../lib/types";
import * as UI from "../lib/ui";

export const buildListCommand = (scopes: Scope[]) => {
  const scopeNamePluralized = scopes.map((scope) => pluralize(scope.name));

  return new Command("list")
    .addArgument(new Argument("[scope]").choices(scopeNamePluralized))
    .action((scopeName) => {
      if (!scopeName) {
        UI.printAvailableScopes(scopes);
        return;
      }
      const scope = scopes.find((s) => s.name === scopeName);
      scope ? UI.printAvailableItems(scope) : UI.printAvailableScopes(scopes);
    })
    .usage("<scope>")
    .addHelpText(
      "after",
      `
Available scopes:
  ${scopeNamePluralized.join(", ")}`,
    );
};

export default buildListCommand;
