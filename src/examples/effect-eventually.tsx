"use client"

import { Effect, Schedule } from "effect"
import { useMemo, useRef } from "react"
import { EffectExample } from "@/components/display"
import { EmojiResult } from "@/components/renderers"
import type { ExampleComponentProps } from "@/lib/example-types"
import { visualEffect } from "@/VisualEffect"
import { getDelay } from "./helpers"

export function EffectRetryExample({ exampleId, index, metadata }: ExampleComponentProps) {
  const retryCountRef = useRef(0)

  const swipeCardTask = useMemo(
    () =>
      visualEffect(
        "swipeCard",
        Effect.gen(function* () {
          const delay = getDelay(200, 400)
          yield* Effect.sleep(delay)

          // Determine failure based on current retry count
          const currentRetryCount = retryCountRef.current
          const failureThreshold = Math.floor(Math.random() * 4) + 2 // 2-5 failures needed
          const shouldFail = currentRetryCount < failureThreshold

          if (shouldFail) {
            retryCountRef.current += 1
            // Randomly select from different error messages
            const errors = [
              "Card Read Error!",
              "Too Fast!",
              "Too Slow!",
              "Overdraft Fee!",
              "Insufficient Funds!",
            ]
            const randomError = errors[Math.floor(Math.random() * errors.length)]
            return yield* Effect.fail(randomError)
          }

          // Success! Reset the counter and return result
          retryCountRef.current = 0
          return new EmojiResult("💰")
        }),
      ),
    [retryCountRef],
  )

  const retryTask = useMemo(() => {
    const retry = swipeCardTask.effect.pipe(
      Effect.retry(Schedule.forever.pipe(Schedule.addDelay(() => "1 second"))),
    )

    return visualEffect("result", retry)
  }, [swipeCardTask])

  const codeSnippet = `
const swipeCard = swipeCard();
const result = Effect.eventually(swipeCard);`

  const taskHighlightMap = useMemo(
    () => ({
      swipeCard: { text: "swipeCard()" },
      result: { text: "Effect.eventually(swipeCard)" },
    }),
    [],
  )

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={useMemo(() => [swipeCardTask], [swipeCardTask])}
      resultEffect={retryTask}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectRetryExample
