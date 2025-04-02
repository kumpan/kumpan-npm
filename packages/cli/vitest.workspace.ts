import react from "@vitejs/plugin-react-swc";
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    test: {
      name: "cli",
      environment: "node",
      setupFiles: ["./tests/setup.ts"],
      include: ["tests/*.test.ts"],
    },
  },
  {
    plugins: [react()],
    test: {
      name: "browser",
      environment: "jsdom",
      include: ["scopes/**/*.test.ts"],
    },
  },
]);
