#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";
import buildAddCommand from "./commands/add";
import buildListCommand from "./commands/list";

import { resolve } from "node:path";
import { readScopes } from "./readScopes";

const program = new Command();

const scopesDir = resolve("scopes");
const scopes = readScopes(scopesDir);

program.name("kumpan").description("CLI to some stuff").version("0.0.1");

program.addCommand(buildAddCommand(scopes));
program.addCommand(buildListCommand(scopes));

program.parse();
