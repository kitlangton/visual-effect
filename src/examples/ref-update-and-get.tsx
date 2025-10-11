"use client"

import { Duration, Effect, Ref } from "effect"
import { useMemo } from "react"
import { EffectExample } from "@/components/display"
import { EmojiResult, StringResult } from "@/components/renderers"
import type { ExampleComponentProps } from "@/lib/example-types"
import { visualEffect } from "@/VisualEffect"
import { type VisualRef, visualRef } from "@/VisualRef"

export function EffectRefConcurrentExample({ exampleId, index, metadata }: ExampleComponentProps) {
  // Create a visual ref for the counter
  const counterRef = useMemo(() => visualRef("counter", 0), [])

  const updateAndGetRef = useMemo(
    () =>
      Effect.gen(function* () {
        yield* Effect.sleep(Duration.millis(Math.random() * 1000 + 500)) // Random delay 500-1500ms
        const newValue = yield* counterRef.updateAndGet(n => n + 1)
        yield* Effect.sleep(Duration.millis(50)) // Random delay 500-1500ms
        return new StringResult(`${newValue}`)
      }),
    [counterRef],
  )

  // Create 5 individual increment tasks that each increment the ref by 1
  const incrementTask1 = useMemo(
    () => visualEffect("increment1", updateAndGetRef),
    [updateAndGetRef],
  )

  const incrementTask2 = useMemo(
    () => visualEffect("increment2", updateAndGetRef),
    [updateAndGetRef],
  )

  const incrementTask3 = useMemo(
    () => visualEffect("increment3", updateAndGetRef),
    [updateAndGetRef],
  )

  const incrementTask4 = useMemo(
    () => visualEffect("increment4", updateAndGetRef),
    [updateAndGetRef],
  )

  const incrementTask5 = useMemo(
    () => visualEffect("increment5", updateAndGetRef),
    [updateAndGetRef],
  )

  // Create a task that runs all 5 increment tasks concurrently
  const concurrentTask = useMemo(
    () =>
      visualEffect(
        "concurrent",
        Effect.gen(function* () {
          // Reset the counter
          const ref = yield* counterRef.ref
          yield* Ref.set(ref, 0)
          counterRef.updateValue(0)

          // Run all 5 increment tasks concurrently with unbounded concurrency
          yield* Effect.all(
            [
              incrementTask1.effect,
              incrementTask2.effect,
              incrementTask3.effect,
              incrementTask4.effect,
              incrementTask5.effect,
            ],
            { concurrency: "unbounded" },
          )

          return new EmojiResult("✅")
        }),
      ),
    [counterRef, incrementTask1, incrementTask2, incrementTask3, incrementTask4, incrementTask5],
  )

  const codeSnippet = `const increment = (counter: Ref<number>) => Effect.gen(function* () {
  yield* Effect.sleep(Duration.millis(Math.random() * 1000 + 500))
  return yield* Ref.updateAndGet(counter, n => n + 1)
})

const concurrent = Effect.gen(function* () {
  const counter = yield* Ref.make(0)
  return yield* Effect.all(
    Array.from({ length: 5 }, () => increment(counter)),
    { concurrency: "unbounded" }
  )
})`

  const taskHighlightMap = useMemo(
    () => ({
      increment1: { text: "Ref.updateAndGet(counterRef, n => n + 1)" },
      increment2: { text: "Ref.updateAndGet(counterRef, n => n + 1)" },
      increment3: { text: "Ref.updateAndGet(counterRef, n => n + 1)" },
      increment4: { text: "Ref.updateAndGet(counterRef, n => n + 1)" },
      increment5: { text: "Ref.updateAndGet(counterRef, n => n + 1)" },
      concurrent: {
        text: 'Effect.all([...], { concurrency: "unbounded" })',
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
      effects={useMemo(
        () => [incrementTask1, incrementTask2, incrementTask3, incrementTask4, incrementTask5],
        [incrementTask1, incrementTask2, incrementTask3, incrementTask4, incrementTask5],
      )}
      resultEffect={concurrentTask}
      effectHighlightMap={taskHighlightMap}
      refs={useMemo(() => [counterRef as VisualRef<unknown>], [counterRef])}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectRefConcurrentExample
