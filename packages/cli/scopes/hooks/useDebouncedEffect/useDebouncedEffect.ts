import { type DependencyList, type EffectCallback, useEffect, useMemo, useRef } from "react";

type DebounceOptions = {
  delay: number;
};

const useDebouncedEffect = (
  effect: EffectCallback,
  deps?: DependencyList,
  options: DebounceOptions = { delay: 1000 },
) => {
  const lastCall = useRef<number | null>(null);

  const dependencies: DependencyList = useMemo(
    () => [...(deps || []), options.delay],
    [deps, options.delay],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Handled by useMemo above
  useEffect(() => {
    const shouldCallEffect = lastCall.current && Date.now() - lastCall.current > options.delay;

    if (shouldCallEffect || lastCall.current === null) {
      effect();
      lastCall.current = Date.now();
    }
  }, dependencies);
};

export default useDebouncedEffect;
