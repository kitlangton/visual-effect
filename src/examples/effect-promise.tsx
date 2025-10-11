"use client"

import { useMemo } from "react"
import { EffectExample } from "@/components/display"
import type { ExampleComponentProps } from "@/lib/example-types"
import { visualEffect } from "@/VisualEffect"
import { getWeather } from "./helpers"

export function EffectPromiseExample({ exampleId, index, metadata }: ExampleComponentProps) {
  // Simulate a weather API call with built-in jittered delay
  const promiseTask = useMemo(() => visualEffect("london", getWeather("London")), [])

  const codeSnippet = `function readTemperature(location) {
  return Effect.promise(() =>
    fetch(\`slow.weather.com/api/\${location}\`)
     .then(r => r.json())
  )
}

const london = readTemperature("London")
`

  const taskHighlightMap = useMemo(
    () => ({
      london: {
        text: 'readTemperature("London")',
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
      effects={useMemo(() => [promiseTask], [promiseTask])}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectPromiseExample
