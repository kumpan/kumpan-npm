import { Argument, Command } from "@commander-js/extra-typings";
import { singular } from "pluralize";
import { copyItem } from "../copyItem";
import type { Scope } from "../types";
import * as UI from "../ui";

export const buildAddCommand = (scopes: Scope[]) => {
  const command = new Command("add");

  for (const scope of scopes) {
    const itemNames = scope.items.map((item) => item.name);
    command.addCommand(
      new Command(singular(scope.name))
        .addArgument(new Argument("[item]").choices(itemNames))
        .argument("[path]")
        .option("-l, --list", `List available ${scope}`)
        .usage("<scope> [item] [path]")
        .action((itemName, path, opts) => {
          const item = itemName ? scope.items.find((item) => item.name === itemName) : null;
          if (opts.list) {
            UI.printAvailableItems(scope);
          } else if (item && path) {
            copyItem(item, path);
          } else {
            UI.printError(`${scope.name} ${itemName} not found`);
          }
        }),
    );
  }
  return command;
};

export default buildAddCommand;
