"use client";

import { Effect } from "effect";
import { useMemo, useRef } from "react";
import { EffectExample } from "@/components/display";
import { TemperatureResult } from "@/components/renderers";
import { useVisualEffect } from "@/hooks/useVisualEffects";
import type { ExampleComponentProps } from "@/lib/example-types";
import { VisualEffect } from "@/VisualEffect";
import { getDelay } from "./helpers";

export function EffectFirstSuccessOfExample({
  exampleId,
  index,
  metadata,
}: ExampleComponentProps) {
  const attemptCountRef = useRef(0);

  // Primary endpoint - fails on first 2 attempts, succeeds on 3rd+
  const primary = useVisualEffect("primary", () =>
    Effect.gen(function* () {
      const delay = getDelay(300, 600);
      yield* Effect.sleep(delay);

      const currentAttempt = attemptCountRef.current;
      const cyclePosition = currentAttempt % 3;

      // Fail on positions 0 and 1, succeed on position 2
      if (cyclePosition === 0 || cyclePosition === 1) {
        return yield* Effect.fail("Primary Unreachable");
      } else {
        return new TemperatureResult(72, "Primary");
      }
    })
  );

  // Secondary endpoint - fails on first attempt, succeeds on 2nd+
  const secondary = useVisualEffect("secondary", () =>
    Effect.gen(function* () {
      const delay = getDelay(400, 700);
      yield* Effect.sleep(delay);

      const currentAttempt = attemptCountRef.current;
      const cyclePosition = currentAttempt % 3;

      // Fail only on position 0
      if (cyclePosition === 0) {
        return yield* Effect.fail("Secondary Unavailable");
      } else {
        return new TemperatureResult(73, "Secondary");
      }
    })
  );

  // Tertiary endpoint - always succeeds
  const tertiary = useVisualEffect("tertiary", () =>
    Effect.gen(function* () {
      const delay = getDelay(500, 800);
      yield* Effect.sleep(delay);
      return new TemperatureResult(74, "Tertiary");
    })
  );

  const firstSuccessOfTask = useMemo(() => {
    const firstSuccessOf = Effect.gen(function* () {
      attemptCountRef.current++;

      return yield* Effect.firstSuccessOf([
        primary.effect,
        secondary.effect,
        tertiary.effect,
      ]);
    });

    return new VisualEffect("result", firstSuccessOf);
  }, [primary, secondary, tertiary]);

  const codeSnippet = `
const primary = fetchFromPrimary();
const secondary = fetchFromSecondary();
const tertiary = fetchFromTertiary();

const result = Effect.firstSuccessOf([
  primary,
  secondary,
  tertiary
]);
  `;

  const taskHighlightMap = useMemo(
    () => ({
      primary: { text: "fetchFromPrimary()" },
      secondary: { text: "fetchFromSecondary()" },
      tertiary: { text: "fetchFromTertiary()" },
      result: { text: "Effect.firstSuccessOf([...])" },
    }),
    []
  );

  const tasks = useMemo(
    () => [primary, secondary, tertiary],
    [primary, secondary, tertiary]
  );

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={tasks}
      resultEffect={firstSuccessOfTask}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  );
}

export default EffectFirstSuccessOfExample;
