import { Command } from "@commander-js/extra-typings";

const program = new Command();

program.name("kumpan").description("CLI to some stuff").version("0.0.1");

program.parse();
