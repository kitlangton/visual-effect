"use client"

import { Effect, Schedule } from "effect"
import { useMemo } from "react"
import { EffectExample } from "@/components/display"
import { StringResult } from "@/components/renderers"
import type { ExampleComponentProps } from "@/lib/example-types"
import { visualEffect } from "@/VisualEffect"
import { createCounter } from "./helpers"

const snoozeCount = createCounter(0)
const scenarioCount = createCounter(0)

const snoozeMessages = [
  "😴 Snooze #1",
  "😪 Snooze #2",
  "🥱 Snooze #3",
  "😵 Snooze #4",
  "💀 Asleep Forever",
]

function hitSnooze(): Effect.Effect<StringResult | undefined, string | undefined, never> {
  return Effect.gen(function* () {
    yield* Effect.sleep(500)

    const messageIndex = Math.min(snoozeCount.current, snoozeMessages.length - 1)
    const message = snoozeMessages[messageIndex]
    snoozeCount.increment()

    // Cycle through 3 scenarios: Death (0), Wake at Snooze 2 (1), Wake at Snooze 4 (2)
    const scenario = scenarioCount.current % 3

    if (scenario === 1 && snoozeCount.current >= 3) {
      // Scenario 1: Wake up after snooze #2
      return new StringResult("👀 I'M UP!")
    } else if (scenario === 2 && snoozeCount.current >= 5) {
      // Scenario 2: Wake up after snooze #4
      return new StringResult("👀 I'M UP!")
    }

    // Always fail - either building up to success or going to death
    return yield* Effect.fail(message)
  })
}

const snoozeSchedule = Schedule.intersect(Schedule.spaced("2 seconds"), Schedule.recurs(4))

export function EffectRetryRecursExample({ exampleId, index, metadata }: ExampleComponentProps) {
  const baseTask = useMemo(() => visualEffect("wakeUp", hitSnooze()), [])

  const repeatedTask = useMemo(
    () =>
      visualEffect(
        "result",
        baseTask.effect.pipe(
          Effect.retry(snoozeSchedule),
          Effect.ensuring(
            Effect.all([snoozeCount.reset, Effect.sync(() => scenarioCount.increment())]),
          ),
        ),
      ),
    [baseTask],
  )

  const codeSnippet = `const wakeUp = attemptToWakeUp();
const snoozeSchedule = Schedule.intersect(
  Schedule.spaced("2 seconds"),
  Schedule.recurs(4)
);
const result = Effect.retry(wakeUp, snoozeSchedule);`

  const taskHighlightMap = useMemo(
    () => ({
      wakeUp: { text: "attemptToWakeUp()" },
      result: {
        text: `
  Effect.retry(wakeUp, snoozeSchedule)`.trim(),
      },
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

export default EffectRetryRecursExample
