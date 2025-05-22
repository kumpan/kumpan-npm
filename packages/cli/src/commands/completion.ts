import fs from "node:fs";
import { join } from "node:path";
import { Command } from "@commander-js/extra-typings";
import * as UI from "../lib/ui";
import { exists, getKumpanConfigDir, getRootDir, mkdirs } from "../utils/fs";

export const buildCompletionCommand = () => {
  const completerFilename = "completion.zsh";
  const completerSourcePath = join(getRootDir(), "extra", completerFilename);
  const completerTargetPath = join(getKumpanConfigDir(), completerFilename);
  const command = new Command("completion");

  command
    .description("Install/Uninstall tab completions")
    .option("--root")
    .option("--zshrc")
    .action((opts) => {
      if (opts.root) {
        UI.printRoot();
      } else if (opts.zshrc) {
        UI.printCompletionRC();
      }
    });

  command
    .command("install")
    .description("Install tab completion")
    .action(async () => {
      if (exists(completerTargetPath)) {
        UI.printWarning("Already installed");
        return;
      }

      const response = await UI.prompt(
        `The following file will be created:
  ${completerTargetPath}

Proceed?(Y/n): `,
      );

      if (response.toLowerCase() !== "n") {
        if (!exists(completerTargetPath)) {
          mkdirs(completerTargetPath);
        }

        const completionScript = fs
          .readFileSync(completerSourcePath, "utf8")
          .replaceAll("__ROOT__", getRootDir());

        fs.writeFileSync(completerTargetPath, completionScript, "utf8");

        UI.printCompletionInstallInstructions();
      }
    });

  command
    .command("uninstall")
    .description("Uninstall tab completion")
    .action(async () => {
      if (!exists(completerTargetPath)) {
        UI.printWarning("Completer is not installed");
        return;
      }

      const response = await UI.prompt(
        `The following file will be deleted:
  ${completerTargetPath}

Proceed?(y/N): `,
      );

      if (response.toLowerCase() === "y") {
        fs.rmSync(completerTargetPath);
      }
    });

  return command;
};
