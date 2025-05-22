#!/usr/bin/env node
import { join } from "node:path";
import { createCLI } from "./kumpan-cli";
import { readScopes } from "./lib/readScopes";
import { getRootDir } from "./utils/fs";

const scopesDir = join(getRootDir(), "scopes");
const scopes = readScopes(scopesDir);
const program = createCLI(scopes);

program.parse();
