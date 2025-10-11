"use client"

import { Effect } from "effect"
import { useMemo } from "react"
import { EffectExample } from "@/components/display"
import { TemperatureArrayResult } from "@/components/renderers/TemperatureResult"
import type { ExampleComponentProps } from "@/lib/example-types"
import { visualEffect } from "@/VisualEffect"
import { getWeather } from "./helpers"

const locations = ["New York", "London", "Tokyo"]

export function EffectForEachExample({ exampleId, index, metadata }: ExampleComponentProps) {
  // Create tasks at the top level
  const newYorkTask = useMemo(() => visualEffect("newYork", getWeather("New York")), [])
  const londonTask = useMemo(() => visualEffect("london", getWeather("London")), [])
  const tokyoTask = useMemo(() => visualEffect("tokyo", getWeather("Tokyo")), [])

  const locationTasks = useMemo(
    () => [newYorkTask, londonTask, tokyoTask],
    [newYorkTask, londonTask, tokyoTask],
  )

  const forEachTask = useMemo(() => {
    const forEach = Effect.forEach(locations, (_, i) => {
      const task = locationTasks[i]
      return task ? task.effect : Effect.fail("Task not found")
    }).pipe(Effect.map(results => new TemperatureArrayResult(results.map(r => r.value))))

    return visualEffect("result", forEach)
  }, [locationTasks])

  const codeSnippet = `const locations = ["New York", "London", "Tokyo"];

const result = Effect.forEach(locations, getWeather);`

  const taskHighlightMap = useMemo(
    () => ({
      newYork: { text: "New York" },
      london: { text: "London" },
      tokyo: { text: "Tokyo" },
      result: { text: "Effect.forEach(locations, getWeather)" },
    }),
    [],
  )

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={locationTasks}
      resultEffect={forEachTask}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectForEachExample
