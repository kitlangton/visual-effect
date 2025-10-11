"use client"

import { Effect } from "effect"
import { useMemo } from "react"
import { EffectExample } from "@/components/display"
import type { ExampleComponentProps } from "@/lib/example-types"
import { VisualEffect, visualEffect } from "@/VisualEffect"
import { Emoji, loadEmoji } from "./helpers"

export function EffectRaceExample({ exampleId, index, metadata }: ExampleComponentProps) {
  // Create tasks with variable delays for realistic racing
  const tortoise = useMemo(() => visualEffect("tortoise", loadEmoji(Emoji.Tortoise)), [])
  const achilles = useMemo(() => visualEffect("achilles", loadEmoji(Emoji.Achilles)), [])

  // Create race task
  const raceResult = useMemo(() => {
    // Race Effects - returns the first one to complete
    const raceEffect = Effect.race(tortoise.effect, achilles.effect)
    return new VisualEffect("winner", raceEffect)
  }, [tortoise, achilles])

  // Memoize tasks array
  const tasks = useMemo(() => [tortoise, achilles], [tortoise, achilles])

  // Code snippet
  const codeSnippet = `const tortoise = runFast("tortoise")
const achilles = runFast("achilles")  

const winner = Effect.race(tortoise, achilles)`

  // Mapping between task name and the text to highlight
  const taskHighlightMap = useMemo(
    () => ({
      tortoise: {
        text: 'runFast("tortoise")',
      },
      achilles: {
        text: 'runFast("achilles")',
      },
      winner: {
        text: "Effect.race(tortoise, achilles)",
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
      effects={tasks}
      resultEffect={raceResult}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectRaceExample
