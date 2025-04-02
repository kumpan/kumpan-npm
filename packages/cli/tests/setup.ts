import { expect } from "vitest";
import { typedKeys } from "../src/utils/objects";

const equals = (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((elem, index) => equals(elem, b[index]));
  }

  if (a && b && typeof a === "object" && typeof b === "object") {
    return typedKeys(a).every((key) => equals(a[key], b[key]));
  }

  return a === b;
};

expect.extend({
  toContainMatchingObject(received, expected) {
    if (!Array.isArray(received)) {
      return {
        pass: false,
        message: () => `${received} is not an array`,
      };
    }

    const pass = received.some((obj) => equals(expected, obj));

    return {
      pass,
      message: () =>
        `Array does not contain matching object.
${this.utils.EXPECTED_COLOR(
  `Expected:
${JSON.stringify([expected], null, 2)}
`,
)}

${this.utils.RECEIVED_COLOR(
  `Received:
${JSON.stringify(received, null, 2)}`,
)}`,
    };
  },
});
