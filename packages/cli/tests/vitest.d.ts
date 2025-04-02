import "vitest";

interface CustomMatchers<R = unknown> {
  toContainMatchingObject: (obj: object) => R;
}

declare module "vitest" {
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
