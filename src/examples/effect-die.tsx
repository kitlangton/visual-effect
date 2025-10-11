"use client"

import { Effect } from "effect"
import { useMemo } from "react"
import { EffectExample } from "@/components/display"
import type { ExampleComponentProps } from "@/lib/example-types"
import { useVisualEffectState, visualEffect } from "@/VisualEffect"

export function EffectDieExample({ exampleId, index, metadata }: ExampleComponentProps) {
  const deathTask = useMemo(
    () => visualEffect("death", Effect.die(new Error("404: Will to live not found"))),
    [],
  )

  const deathState = useVisualEffectState(deathTask)

  const codeSnippet = `const death = Effect.die(new Error("FATAL: System corrupted"))`

  const taskHighlightMap = useMemo(
    () => ({
      death: {
        text: 'Effect.die(new Error("FATAL: System corrupted"))',
      },
    }),
    [],
  )

  // Start with normal mode, transition to dark when task dies
  const isDarkMode = deathState.type === "death"

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={useMemo(() => [deathTask], [deathTask])}
      effectHighlightMap={taskHighlightMap}
      isDarkMode={isDarkMode}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectDieExample
