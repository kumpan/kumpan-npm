import { createEvent, fireEvent, isInaccessible, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PromiseButton from "./PromiseButton";

describe("PromiseButton", () => {
  it("Shows pending component while the promise is pending", async () => {
    const timer = new Promise((resolve) => setTimeout(resolve, 500));

    const { findByTestId } = render(
      <PromiseButton
        component={({ onClick, children }) => (
          <button type="button" data-testid="btn" onClick={onClick}>
            {children}
          </button>
        )}
        componentProps={{
          onClick: () => {
            return timer;
          },
        }}
        pendingComponent={<output data-testid="loader">Loading</output>}
      >
        Click me
      </PromiseButton>,
    );

    const btn = await findByTestId("btn");
    const loader = await findByTestId("loader");

    expect(isInaccessible(loader)).toBe(true);

    const clickEvent = createEvent.click(btn);
    fireEvent(btn, clickEvent);

    expect(isInaccessible(loader)).toBe(false);

    await waitFor(() => expect(isInaccessible(loader)).toBe(true), { timeout: 500 });
  });
});
