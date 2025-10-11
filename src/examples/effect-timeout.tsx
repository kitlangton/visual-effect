"use client"

import { Effect } from "effect"
import { useMemo, useRef } from "react"
import { EffectExample } from "@/components/display"
import { EmojiResult } from "@/components/renderers"
import type { ExampleComponentProps } from "@/lib/example-types"
import { visualEffect } from "@/VisualEffect"
import { getDelay } from "./helpers"

const failureMessages = ["TOO SLOW!", "SPOILED!", "STARVED TO DEATH!", "IT'S COLD!"]

export function EffectTimeoutExample({ exampleId, index, metadata }: ExampleComponentProps) {
  const attemptRef = useRef(0)

  const pizza = useMemo(
    () =>
      visualEffect(
        "pizza",
        Effect.gen(function* () {
          const attempt = attemptRef.current
          attemptRef.current++

          // First attempt always times out, second attempt succeeds
          const isFirstAttempt = attempt % 2 === 0
          const delay = isFirstAttempt
            ? getDelay(1500, 2000) // Will timeout (longer than 1 second)
            : getDelay(400, 700) // Will succeed (shorter than 1 second)

          yield* Effect.sleep(delay)

          return new EmojiResult("🍕")
        }),
      ),
    [],
  )

  const timeoutTask = useMemo(() => {
    const timeout = pizza.effect.pipe(
      Effect.timeout("1 second"),
      Effect.orElseFail(() => failureMessages[attemptRef.current % failureMessages.length]),
    )

    return visualEffect("result", timeout, true)
  }, [pizza])

  const codeSnippet = `
const pizza = orderDelivery();
const result = Effect.timeout(pizza, "1 second");`

  const taskHighlightMap = useMemo(
    () => ({
      pizza: { text: "orderDelivery()" },
      result: { text: 'Effect.timeout(pizza, "1 second")' },
    }),
    [],
  )

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={useMemo(() => [pizza], [pizza])}
      resultEffect={timeoutTask}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectTimeoutExample
