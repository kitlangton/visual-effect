"use client"

import { Effect } from "effect"
import { useMemo } from "react"
import { EffectExample } from "@/components/display"
import type { ExampleComponentProps } from "@/lib/example-types"
import { visualEffect } from "@/VisualEffect"

export function EffectFailExample({ exampleId, index, metadata }: ExampleComponentProps) {
  const failTask = useMemo(() => visualEffect("error", Effect.fail(new Error("Kaboom!"))), [])

  const codeSnippet = `const error = Effect.fail("Kaboom!")`

  const taskHighlightMap = useMemo(
    () => ({
      error: {
        text: 'Effect.fail("Kaboom!")',
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
      effects={useMemo(() => [failTask], [failTask])}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectFailExample
