import { renderHook, waitFor } from "@testing-library/react";
import { useEffect, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import useDebouncedEffect from "./useDebouncedEffect";

describe("useDebouncedEffect", () => {
  it("works", async () => {
    const effect = vi.fn();
    const debouncedEffect = vi.fn();

    const fastEffectDelay = 10;
    const debouncedEffectDelay = fastEffectDelay * 10;
    const debounceCount = 2;
    const effectCount = 10;

    const { result } = renderHook(() => {
      const [counter, setCounter] = useState(1);
      useEffect(() => {
        effect();
        if (counter < effectCount) {
          setTimeout(() => setCounter(counter + 1), fastEffectDelay);
        }
      }, [counter]);

      useDebouncedEffect(() => debouncedEffect(counter), [counter], {
        delay: debouncedEffectDelay,
      });

      return counter;
    });

    await waitFor(() => expect(result.current).toBe(effectCount));

    expect(effect).toHaveBeenCalledTimes(effectCount);
    expect(debouncedEffect).toHaveBeenCalledTimes(debounceCount);
  });
});
