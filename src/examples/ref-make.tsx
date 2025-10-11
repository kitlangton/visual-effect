"use client"

import { Duration, Effect, Ref, Schedule } from "effect"
import { useMemo } from "react"
import { EffectExample } from "@/components/display"
import { EmojiResult, StringResult } from "@/components/renderers"
import type { ExampleComponentProps } from "@/lib/example-types"
import { visualEffect } from "@/VisualEffect"
import { type VisualRef, visualRef } from "@/VisualRef"

export function EffectRefExample({ exampleId, index, metadata }: ExampleComponentProps) {
  // Create a visual ref for the counter
  const counterRef = useMemo(() => visualRef("counter", 0), [])

  // Create a task that increments the counter
  const incrementTask = useMemo(
    () =>
      visualEffect(
        "increment",
        Effect.gen(function* () {
          yield* Effect.sleep(400)
          const newValue = yield* counterRef.updateAndGet(n => n + 1)
          yield* Effect.sleep(150)
          return new StringResult(`${newValue}`)
        }),
      ),
    [counterRef],
  )

  // Create a task that repeats the increment 5 times
  const repeatTask = useMemo(
    () =>
      visualEffect(
        "repeat",
        Effect.gen(function* () {
          // Reset the counter
          const ref = yield* counterRef.ref
          yield* Ref.set(ref, 0)
          counterRef.updateValue(0)

          // Repeat the increment task 5 times with a schedule
          yield* incrementTask.effect.pipe(
            Effect.repeat(
              Schedule.recurs(4).pipe(Schedule.compose(Schedule.spaced(Duration.millis(400)))),
            ), // 4 repeats + 1 initial = 5 total
          )

          return new EmojiResult("✅")
        }),
      ),
    [counterRef, incrementTask],
  )

  const codeSnippet = `
const increment = (counter: Ref<number>) => 
  Ref.updateAndGet(counter, n => n + 1)

const repeat = Effect.gen(function* () {
  const counter = yield* Ref.make(0)
  yield* Effect.repeat(increment(counter), Schedule.recurs(4))
})`

  const taskHighlightMap = useMemo(
    () => ({
      increment: { text: "Ref.updateAndGet(counter, n => n + 1)" },
      repeat: { text: "Effect.repeat(increment, Schedule.recurs(4))" },
    }),
    [],
  )

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={useMemo(() => [incrementTask], [incrementTask])}
      resultEffect={repeatTask}
      effectHighlightMap={taskHighlightMap}
      refs={useMemo(() => [counterRef as VisualRef<unknown>], [counterRef])}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectRefExample
