"use client"

import { Effect } from "effect"
import { useMemo, useRef } from "react"
import { EffectExample } from "@/components/display"
import { EmojiResult } from "@/components/renderers"
import type { ExampleComponentProps } from "@/lib/example-types"
import { VisualEffect, visualEffect } from "@/VisualEffect"
import { getDelay } from "./helpers"

export function EffectOrElseExample({ exampleId, index, metadata }: ExampleComponentProps) {
  const attemptCountRef = useRef(0)

  const shoot = useMemo(
    () =>
      visualEffect(
        "shoot",
        Effect.gen(function* () {
          const delay = getDelay(300, 600)
          yield* Effect.sleep(delay)

          const currentAttempt = attemptCountRef.current
          attemptCountRef.current++
          const cyclePosition = currentAttempt % 3

          // Cycle: 0 = fail, 1 = succeed, 2 = fail
          if (cyclePosition === 0 || cyclePosition === 2) {
            return yield* Effect.fail("Out of Ammo!")
          } else {
            return new EmojiResult("🔫")
          }
        }),
      ),
    [],
  )

  const question = useMemo(
    () =>
      visualEffect(
        "question",
        Effect.gen(function* () {
          const delay = getDelay(400, 700)
          yield* Effect.sleep(delay)

          const currentAttempt = attemptCountRef.current - 1 // Use -1 because shoot already incremented
          const cyclePosition = currentAttempt % 3

          // Fail only on the third attempt of each cycle (position 2)
          if (cyclePosition === 2) {
            return yield* Effect.fail("Brain Fart!")
          } else {
            return new EmojiResult("💬")
          }
        }),
      ),
    [attemptCountRef],
  )

  const orElseTask = useMemo(() => {
    const orElse = Effect.orElse(shoot.effect, () => question.effect)
    return new VisualEffect("result", orElse)
  }, [shoot, question])

  const codeSnippet = `
const shoot = shootFirst();
const question = askQuestions();
const result = Effect.orElse(shoot, () => question);
  `

  const taskHighlightMap = useMemo(
    () => ({
      shoot: { text: "shootFirst()" },
      question: { text: "askQuestions()" },
      result: { text: "Effect.orElse(shoot, () => question)" },
    }),
    [],
  )

  const tasks = useMemo(() => [shoot, question], [shoot, question])

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={tasks}
      resultEffect={orElseTask}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectOrElseExample
