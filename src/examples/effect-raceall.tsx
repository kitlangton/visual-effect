"use client"

import { Effect } from "effect"
import { useMemo } from "react"
import { EffectExample } from "@/components/display"
import { useVisualEffects } from "@/hooks/useVisualEffects"
import type { ExampleComponentProps } from "@/lib/example-types"
import { VisualEffect } from "@/VisualEffect"
import { Emoji, loadEmoji } from "./helpers"

export function EffectRaceAllExample({ exampleId, index, metadata }: ExampleComponentProps) {
  // Create tasks with variable delays to simulate real CDN conditions
  const { cat, dog, mouse, rabbit } = useVisualEffects({
    cat: () => loadEmoji(Emoji.Cat),
    dog: () => loadEmoji(Emoji.Dog),
    mouse: () => loadEmoji(Emoji.Mouse),
    rabbit: () => loadEmoji(Emoji.Rabbit),
  })

  // Create race task
  const winner = useMemo(() => {
    // Race all effects - returns the first one to complete
    const raceEffect = Effect.raceAll([cat.effect, dog.effect, mouse.effect, rabbit.effect])

    return new VisualEffect("winner", raceEffect)
  }, [cat, dog, mouse, rabbit])

  // Code snippet
  const codeSnippet = `
const cat = runFast("cat")
const dog = runFast("dog")  
const mouse = runFast("mouse")
const rabbit = runFast("rabbit")

const winner = Effect.raceAll([cat, dog, mouse, rabbit])`

  // Mapping between task name and the text to highlight
  const taskHighlightMap = useMemo(
    () => ({
      cat: {
        text: 'runFast("cat")',
      },
      dog: {
        text: 'runFast("dog")',
      },
      mouse: {
        text: 'runFast("mouse")',
      },
      rabbit: {
        text: 'runFast("rabbit")',
      },
      winner: {
        text: "Effect.raceAll([cat, dog, mouse, rabbit])",
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
      effects={useMemo(() => [cat, dog, mouse, rabbit], [cat, dog, mouse, rabbit])}
      resultEffect={winner}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectRaceAllExample
