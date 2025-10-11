"use client"

import { Effect, Schedule } from "effect"
import { useMemo } from "react"
import { EffectExample } from "@/components/display"
import type { ExampleComponentProps } from "@/lib/example-types"
import { visualEffect } from "@/VisualEffect"
import { createCounter, getDelay } from "./helpers"

const parkingAttempt = createCounter(0)

const attempts = ["😤 Too Close!", "😡 Too Far!", "🤬 Neutral!", "😑 Focus."]

function attemptParallelPark(): Effect.Effect<void, string, never> {
  return Effect.gen(function* () {
    const delay = getDelay(400, 800)
    yield* Effect.sleep(delay)

    const message = attempts[Math.min(parkingAttempt.current, attempts.length - 1)]!

    parkingAttempt.increment()

    // Reset counter after giving up
    if (parkingAttempt.current > attempts.length) {
      return "🚗 Parked!"
    }

    return yield* Effect.fail(message)
  })
}

export function EffectRetryExponentialExample({
  exampleId,
  index,
  metadata,
}: ExampleComponentProps) {
  const baseTask = useMemo(() => visualEffect("park", attemptParallelPark()), [])

  const repeatedTask = useMemo(
    () =>
      visualEffect(
        "result",
        Effect.retry(baseTask.effect, Schedule.exponential("700 millis")).pipe(
          Effect.ensuring(parkingAttempt.reset),
        ),
      ),
    [baseTask],
  )

  const codeSnippet = `const park = attemptParallelPark();
const result = Effect.retry(park, Schedule.exponential("700 millis"));`

  const taskHighlightMap = useMemo(
    () => ({
      park: { text: "attemptParallelPark()" },
      result: { text: 'Effect.retry(park, Schedule.exponential("700 millis"))' },
    }),
    [],
  )

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={useMemo(() => [baseTask], [baseTask])}
      resultEffect={repeatedTask}
      effectHighlightMap={taskHighlightMap}
      showScheduleTimeline={true}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectRetryExponentialExample
