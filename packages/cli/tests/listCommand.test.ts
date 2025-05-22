import { CommanderError } from "commander";
import { describe, expect, it, vi } from "vitest";
import buildListCommand from "../src/commands/list";
import * as UI from "../src/lib/ui";

vi.mock("../src/ui");

describe("list command", () => {
  it("has the scope names as first argument", () => {
    const scopes = [
      { name: "components", path: "/scopes/components", items: [] },
      { name: "hooks", path: "/scopes/hooks", items: [] },
    ];

    const expectedArguments = { argChoices: ["components", "hooks"] };

    const cmd = buildListCommand(scopes);

    const [firstArgument] = cmd.registeredArguments;
    expect(firstArgument).toMatchObject(expectedArguments);
  });

  it("shows available scopes if no argument is passed", () => {
    const scopes = [
      { name: "components", path: "/scopes/components", items: [] },
      { name: "hooks", path: "/scopes/hooks", items: [] },
    ];
    const spy = vi.spyOn(UI, "printAvailableScopes");
    const cmd = buildListCommand(scopes);
    cmd.parse();
    expect(spy).toHaveBeenCalledWith(scopes);
  });

  it("shows available items for chosen scope", () => {
    const componentsScope = { name: "components", path: "/scopes/components", items: [] };
    const hooksScope = { name: "hooks", path: "/scopes/hooks", items: [] };
    const scopes = [componentsScope, hooksScope];

    const spy = vi.spyOn(UI, "printAvailableItems");

    const cmd = buildListCommand(scopes);

    cmd.parse(["", "", "components"]);

    expect(spy).toHaveBeenCalledWith(componentsScope);

    process.argv.push("hooks");
    cmd.parse();
    process.argv.pop();

    expect(spy).toHaveBeenCalledWith(hooksScope);
  });

  it("throws an error if invalid scope name was passed", () => {
    const scopes = [
      { name: "components", path: "/scopes/components", items: [] },
      { name: "hooks", path: "/scopes/hooks", items: [] },
    ];

    const cmd = buildListCommand(scopes).exitOverride().configureOutput({ writeErr: vi.fn() });

    expect(() => cmd.parse(["", "", ""])).toThrowError(CommanderError);
  });
});
