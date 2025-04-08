import { Command } from "@commander-js/extra-typings";
import buildAddCommand from "./commands/add";
import buildListCommand from "./commands/list";

import { join } from "node:path";
import { buildCompletionCommand } from "./commands/completion";
import { readScopes } from "./readScopes";
import { getRootDir } from "./utils/fs";

const program = new Command();

const scopesDir = join(getRootDir(), "scopes");
const scopes = readScopes(scopesDir);

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

export default program;
