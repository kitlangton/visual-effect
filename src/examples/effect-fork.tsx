"use client"

import { Console, Effect, Fiber } from "effect"
import { useMemo, useRef } from "react"
import { EffectExample } from "@/components/display"
import { StringResult } from "@/components/renderers"
import { useVisualEffect } from "@/hooks/useVisualEffects"
import type { ExampleComponentProps } from "@/lib/example-types"
import type { VisualEffect } from "@/VisualEffect"

export function EffectForkExample({ exampleId, index, metadata }: ExampleComponentProps) {
  // Use a ref to capture the backgroundTask for self-notification
  const backgroundTaskRef = useRef<VisualEffect<never, never> | null>(null)

  // Background task that pings forever
  const backgroundTask = useVisualEffect("background", () =>
    Console.log("⭐").pipe(
      Effect.tap(() =>
        Effect.sync(() => {
          backgroundTaskRef.current?.notify("⭐", { duration: 1200 })
        }),
      ),
      Effect.delay("600 millis"),
      Effect.forever,
    ),
  )

  // Store the backgroundTask in the ref
  backgroundTaskRef.current = backgroundTask

  // Main task that does some work
  const mainTask = useVisualEffect("main", () =>
    Effect.gen(function* () {
      yield* Effect.sleep(3000)
      return new StringResult("Done!")
    }),
  )

  // Result effect that forks the background task
  const resultEffect = useVisualEffect("result", () =>
    Effect.gen(function* () {
      // Fork the background task - it runs concurrently in a separate fiber
      const fiber = yield* Effect.fork(backgroundTask.effect)

      // Do the main work while background task runs
      const result = yield* mainTask.effect

      // Manually interrupt the forked fiber
      yield* Fiber.interrupt(fiber)

      return result
    }),
  )

  const codeSnippet = `const background = Console.log("⭐").pipe(
  Effect.delay("600 millis"),
  Effect.forever
)

const main = Effect.sleep(3000).pipe(
  Effect.map(() => "Done!")
)

// Fork background task, then do main work
const result = Effect.gen(function* () {
  const fiber = yield* Effect.fork(background)
  const result = yield* main
  yield* Fiber.interrupt(fiber)
  return result
})`

  const taskHighlightMap = useMemo(
    () => ({
      background: {
        text: "background",
      },
      main: {
        text: "main",
      },
      result: {
        text: "const result = Effect.gen",
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
      effects={useMemo(() => [backgroundTask, mainTask], [backgroundTask, mainTask])}
      resultEffect={resultEffect}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectForkExample
