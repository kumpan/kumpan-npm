import { describe, expect, it, vi } from "vitest";
import * as CopyMod from "../src/copyItem";
import * as UI from "../src/ui";

import buildAddCommand from "../src/commands/add";

vi.mock("../src/ui");
vi.mock("../src/copyItem");

describe("add command", () => {
  it("has the singularized scope names as subcommands", () => {
    const scopes = [
      { name: "components", path: "/scopes/components", items: [] },
      { name: "hooks", path: "/scopes/hooks", items: [] },
    ];

    const cmd = buildAddCommand(scopes);
    const subCommands = cmd.commands.map((c) => c.name());
    expect(subCommands).toEqual(["component", "hook"]);
  });

  it("has scope items as first argument for each subcommand", () => {
    const scopes = [
      {
        name: "components",
        path: "/scopes/components",
        items: [
          { name: "ComponentA", path: "/scopes/components/ComponentA" },
          { name: "ComponentB", path: "/scopes/components/ComponentB" },
        ],
      },
      {
        name: "hooks",
        path: "/scopes/hooks",
        items: [
          { name: "useHookA", path: "/scopes/hooks/useHookA" },
          { name: "useHookB", path: "/scopes/hooks/useHookB" },
        ],
      },
    ];

    const [subCommand1, subCommand2] = buildAddCommand(scopes).commands;

    expect(subCommand1?.name()).toBe("component");
    expect(subCommand2?.name()).toBe("hook");

    const firstArg1 = subCommand1?.registeredArguments.at(0);

    expect(firstArg1).toMatchObject({
      argChoices: ["ComponentA", "ComponentB"],
    });

    const firstArg2 = subCommand2?.registeredArguments.at(0);

    expect(firstArg2).toMatchObject({
      argChoices: ["useHookA", "useHookB"],
    });
  });

  it("has a --list option which shows scope items", () => {
    const componentsScope = {
      name: "components",
      path: "/scopes/components",
      items: [
        { name: "ComponentA", path: "/scopes/components/ComponentA" },
        { name: "ComponentB", path: "/scopes/components/ComponentB" },
      ],
    };
    const hooksScope = {
      name: "hooks",
      path: "/scopes/hooks",
      items: [
        { name: "useHookA", path: "/scopes/hooks/useHookA" },
        { name: "useHookB", path: "/scopes/hooks/useHookB" },
      ],
    };
    const scopes = [componentsScope, hooksScope];

    const cmd = buildAddCommand(scopes);

    const spy = vi.spyOn(UI, "printAvailableItems");
    cmd.parse(["", "", "component", "--list"]);
    expect(spy).toHaveBeenCalledWith(componentsScope);

    cmd.parse(["", "", "hook", "--list"]);
    expect(spy).toHaveBeenCalledWith(hooksScope);
  });

  it("calls copyItem with correct arguments", () => {
    const spy = vi.spyOn(CopyMod, "copyItem").mockImplementationOnce(() => {});

    const componentA = { name: "ComponentA", path: "/scopes/components/ComponentA" };
    const componentsScope = {
      name: "components",
      path: "/scopes/components",
      items: [componentA, { name: "ComponentB", path: "/scopes/components/ComponentB" }],
    };
    const hookB = { name: "useHookB", path: "/scopes/hooks/useHookB" };
    const hooksScope = {
      name: "hooks",
      path: "/scopes/hooks",
      items: [{ name: "useHookA", path: "/scopes/hooks/useHookA" }, hookB],
    };

    const scopes = [componentsScope, hooksScope];

    const cmd = buildAddCommand(scopes);

    cmd.parse(["", "", "component", "ComponentA", "./temp"]);

    expect(spy).toHaveBeenCalledWith(componentA, "./temp");

    cmd.parse(["", "", "hook", "useHookB", "./foo/temp"]);

    expect(spy).toHaveBeenCalledWith(hookB, "./foo/temp");
  });
});
