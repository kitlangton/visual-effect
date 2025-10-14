"use client"

import { Effect } from "effect"
import { useMemo } from "react"
import { EffectExample } from "@/components/display"
import { NumberResult } from "@/components/renderers"
import { useVisualEffect } from "@/hooks/useVisualEffects"
import type { ExampleComponentProps } from "@/lib/example-types"

export function EffectSyncExample({ exampleId, index, metadata }: ExampleComponentProps) {
  const syncTask = useVisualEffect("random", () =>
    Effect.sync(() => Math.random()).pipe(Effect.map(value => new NumberResult(value))),
  )

  const codeSnippet = `const random = Effect.sync(() => Math.random())`

  const taskHighlightMap = useMemo(
    () => ({
      random: {
        text: "Effect.sync(() => Math.random())",
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
      effects={useMemo(() => [syncTask], [syncTask])}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectSyncExample
