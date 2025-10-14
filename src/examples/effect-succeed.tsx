"use client"

import { Effect } from "effect"
import { useMemo } from "react"
import { EffectExample } from "@/components/display"
import { NumberResult } from "@/components/renderers"
import { useVisualEffect } from "@/hooks/useVisualEffects"
import type { ExampleComponentProps } from "@/lib/example-types"

export function EffectSucceedExample({ exampleId, index, metadata }: ExampleComponentProps) {
  const successTask = useVisualEffect("value", () =>
    Effect.succeed(42).pipe(Effect.map(value => new NumberResult(value))),
  )

  const codeSnippet = `const value = Effect.succeed(42)`

  const taskHighlightMap = useMemo(
    () => ({
      value: {
        text: "Effect.succeed(42)",
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
      effects={useMemo(() => [successTask], [successTask])}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectSucceedExample
