import { Command } from "@commander-js/extra-typings";
import buildAddCommand from "./commands/add";
import buildListCommand from "./commands/list";

import { buildCompletionCommand } from "./commands/completion";
import type { Scope } from "./lib/types";

export const createCLI = (scopes: Scope[]) => {
  const program = new Command();

  program
    .name("kumpan")
    .description("CLI to some stuff")
    .version("0.0.1")
    .addHelpText(
      "after",
      `
Available scopes:
  ${scopes.map((s) => s.name).join(", ")}`,
    );

  program.addCommand(buildAddCommand(scopes));
  program.addCommand(buildListCommand(scopes));
  program.addCommand(buildCompletionCommand());

  return program;
};
