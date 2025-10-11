"use client"

import { Effect } from "effect"
import { memo, useCallback, useMemo, useState } from "react"
import { EffectExample } from "@/components/display"
import { TemperatureArrayResult } from "@/components/renderers"
import { SegmentedControl } from "@/components/ui"
import type { ExampleComponentProps } from "@/lib/example-types"
import { taskSounds } from "@/sounds/TaskSounds"
import { VisualEffect, visualEffect } from "@/VisualEffect"
import { getWeather } from "./helpers"

type ConcurrencyMode = "sequential" | "unbounded" | "numbered"

// Enhanced configuration component with integrated styling
const ConfigurationPanel = memo(
  ({
    concurrencyMode,
    exampleIndex,
    resetEffect,
    setConcurrencyMode,
  }: {
    concurrencyMode: ConcurrencyMode
    setConcurrencyMode: (mode: ConcurrencyMode) => void
    exampleIndex?: number
    resetEffect: () => void
  }) => (
    <div className="overflow-hidden relative from-neutral-800/40 to-neutral-800/20 bg-gradient-to-t ">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-neutral-500 select-none tracking-wider">
              CONCURRENCY
            </span>
            <SegmentedControl
              value={concurrencyMode}
              onChange={mode => {
                setConcurrencyMode(mode)
                resetEffect()
                taskSounds.playConfigurationChange().catch(() => {})
              }}
              options={["sequential", "numbered", "unbounded"] as const}
              backgroundClassName="bg-neutral-700/80"
              enableKeyboard={true}
              {...(exampleIndex !== undefined && { exampleIndex })}
            />
          </div>
        </div>
      </div>
    </div>
  ),
)

ConfigurationPanel.displayName = "ConfigurationPanel"

export function EffectAllExample({ exampleId, index, metadata }: ExampleComponentProps) {
  const [concurrencyMode, setConcurrencyMode] = useState<ConcurrencyMode>("sequential")

  // Spring animations for smooth transitions (removed to prevent re-animation)

  // Create tasks with built-in jittered delays
  const nyc = useMemo(() => visualEffect("nyc", getWeather("New York")), [])
  const berlin = useMemo(() => visualEffect("berlin", getWeather("Berlin")), [])
  const tokyo = useMemo(() => visualEffect("tokyo", getWeather("Tokyo")), [])
  const london = useMemo(() => visualEffect("london", getWeather("London")), [])

  // Create composed task with dynamic concurrency
  const allTemps = useMemo(() => {
    let concurrencyOption: { concurrency?: "unbounded" | number } = {}

    switch (concurrencyMode) {
      case "sequential":
        // Default behavior - no concurrency option needed
        break
      case "unbounded":
        concurrencyOption = { concurrency: "unbounded" }
        break
      case "numbered":
        concurrencyOption = { concurrency: 2 }
        break
    }

    const allTempsEffect = Effect.all(
      [nyc.effect, berlin.effect, tokyo.effect, london.effect],
      concurrencyOption,
    ).pipe(Effect.map(temps => new TemperatureArrayResult(temps.map(t => t.value))))

    return new VisualEffect("result", allTempsEffect)
  }, [nyc, berlin, tokyo, london, concurrencyMode])

  const resetEffect = useCallback(() => {
    allTemps.reset()
  }, [allTemps])

  // Memoize tasks array
  const tasks = useMemo(() => [nyc, berlin, tokyo, london], [nyc, berlin, tokyo, london])

  // Dynamic code snippet based on concurrency mode
  const getCodeSnippet = () => {
    const baseCode = `const nyc = readTemperature("New York")
const berlin = readTemperature("Berlin")
const tokyo = readTemperature("Tokyo")
const london = readTemperature("London")

const result = Effect.all([nyc, berlin, tokyo, london]`

    switch (concurrencyMode) {
      case "sequential":
        return `${baseCode})`
      case "unbounded":
        return (
          baseCode +
          `, {
  concurrency: "unbounded",
})`
        )
      case "numbered":
        return (
          baseCode +
          `, {
  concurrency: 2,
})`
        )
    }
  }

  // Mapping between task name and the text to highlight
  const taskHighlightMap = useMemo(
    () => ({
      nyc: {
        text: 'readTemperature("New York")',
      },
      berlin: {
        text: 'readTemperature("Berlin")',
      },
      tokyo: {
        text: 'readTemperature("Tokyo")',
      },
      london: {
        text: 'readTemperature("London")',
      },
      result: {
        text:
          concurrencyMode === "sequential"
            ? "Effect.all([nyc, berlin, tokyo, london])"
            : concurrencyMode === "unbounded"
              ? 'concurrency: "unbounded"'
              : `concurrency: 2`,
      },
    }),
    [concurrencyMode],
  )

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={getCodeSnippet()}
      effects={tasks}
      resultEffect={allTemps}
      effectHighlightMap={taskHighlightMap}
      configurationPanel={
        <ConfigurationPanel
          concurrencyMode={concurrencyMode}
          setConcurrencyMode={setConcurrencyMode}
          {...(index !== undefined && { exampleIndex: index })}
          resetEffect={resetEffect}
        />
      }
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectAllExample
