"use client"

import { Effect } from "effect"
import { useMemo } from "react"
import { EffectExample } from "@/components/display"
import { EmojiResult } from "@/components/renderers"
import type { ExampleComponentProps } from "@/lib/example-types"
import { VisualEffect, visualEffect } from "@/VisualEffect"

export function EffectPartitionLickTestExample({
  exampleId,
  index,
  metadata,
}: ExampleComponentProps) {
  const performLick = () => {
    return Effect.gen(function* () {
      const sleep = 500 + Math.random() * 500 // 500-1000ms
      yield* Effect.sleep(sleep)

      // Random chance to return lick emoji or demonic error
      if (Math.random() < 0.5) {
        const lickEmojis = ["👅", "😋", "👄", "😛"]
        const randomLick = lickEmojis[Math.floor(Math.random() * lickEmojis.length)]
        return new EmojiResult(`${randomLick}`)
      } else {
        return yield* Effect.fail("DEMONIC!")
      }
    })
  }

  const iceCream = useMemo(() => visualEffect("iceCream", performLick()), [])
  const battery = useMemo(() => visualEffect("battery", performLick()), [])
  const popsicle = useMemo(() => visualEffect("popsicle", performLick()), [])
  const toad = useMemo(() => visualEffect("toad", performLick()), [])
  const lollipop = useMemo(() => visualEffect("lollipop", performLick()), [])

  const effects = useMemo(
    () => [iceCream, battery, popsicle, toad, lollipop],
    [iceCream, battery, popsicle, toad, lollipop],
  )

  // Partition task to separate failures from successes
  const partitionTask = useMemo(() => {
    const partitionEffect = Effect.partition(effects, eff => eff.effect).pipe(
      Effect.map(
        ([fails, successes]) => new EmojiResult(`👹 ${fails.length} 😇 ${successes.length}`),
      ),
    )

    return new VisualEffect("result", partitionEffect)
  }, [effects])

  const codeSnippet = `const result = Effect.partition(
  [iceCream, battery, popsicle, toad, lollipop],
  performLick
).pipe(
  Effect.map(([fails, successes]) =>
	 \`👹 \${fails.length} 😇 \${successes.length}\`
	)
);`

  const taskHighlightMap = useMemo(
    () => ({
      iceCream: { text: "iceCream" },
      battery: { text: "battery" },
      popsicle: { text: "popsicle" },
      toad: { text: "toad" },
      lollipop: { text: "lollipop" },
      result: { text: "Effect.partition([...])" },
    }),
    [],
  )

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={effects}
      resultEffect={partitionTask}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectPartitionLickTestExample
