"use client"

import { Effect } from "effect"
import { memo, useEffect, useMemo, useState } from "react"
import { EffectExample } from "@/components/display"
import { StringResult } from "@/components/renderers"
import { SegmentedControl } from "@/components/ui"
import { useVisualEffect } from "@/hooks/useVisualEffects"
import { useVisualScope } from "@/hooks/useVisualScope"
import type { ExampleComponentProps } from "@/lib/example-types"
import { taskSounds } from "@/sounds/TaskSounds"
import { VisualScope } from "@/VisualScope"
import { getDelay } from "./helpers"

type Outcome = "succeed" | "fail" | "die" | "interrupt"

// Configuration panel component
const ConfigurationPanel = memo(
  ({ outcome, setOutcome }: { outcome: Outcome; setOutcome: (o: Outcome) => void }) => (
    <div className="overflow-hidden relative from-neutral-800/40 to-neutral-800/20 bg-gradient-to-t ">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-neutral-500 select-none tracking-wider">
              OUTCOME
            </span>
            <SegmentedControl
              value={outcome}
              onChange={o => {
                setOutcome(o)
                taskSounds.playConfigurationChange().catch(() => {})
                // No need to call resetEffect here - useEffect handles it
              }}
              options={["succeed", "fail", "die", "interrupt"] as const}
              backgroundClassName="bg-neutral-700/80"
            />
          </div>
        </div>
      </div>
    </div>
  ),
)

ConfigurationPanel.displayName = "ConfigurationPanel"

export function EffectFinalizerExample({ exampleId, index, metadata }: ExampleComponentProps) {
  const [outcome, setOutcome] = useState<Outcome>("succeed")

  // Visual scope for finalizers
  const scope = useMemo(() => new VisualScope("simpleFinalizer"), [])
  useVisualScope(scope)

  // Effect task that changes based on outcome
  const task = useVisualEffect<StringResult, string>(
    "effect",
    () =>
      Effect.gen(function* () {
        scope.setState("acquiring")

        yield* Effect.sleep(getDelay(300, 400))

        yield* Effect.sync(() => scope.addFinalizer("🧹 Clean up"))

        scope.setState("active")

        yield* Effect.sleep(getDelay(600, 900))

        switch (outcome) {
          case "succeed":
            return new StringResult("Done")
          case "fail":
            return yield* Effect.fail("💥 Fail")
          case "die":
            return yield* Effect.die("☠️ Die")
          case "interrupt":
            yield* Effect.sleep(60 * 60 * 1000)
            return new StringResult("Interrupted")
        }
      }),
    { deps: [outcome, scope] },
  )

  // Cleanup function to interrupt old task when outcome changes
  useEffect(() => {
    // Capture the current task in the closure
    const currentTask = task
    const currentScope = scope

    return () => {
      // When outcome changes, interrupt and reset the OLD task
      currentTask.interrupt()
      currentTask.reset()
      currentScope.reset()
    }
  }, [task]) // Re-run when task changes (which happens when outcome changes)

  // Ensure finalizers run when task ends
  useEffect(() => {
    const unsub = task.subscribe(() => {
      if (
        (task.state.type === "completed" ||
          task.state.type === "interrupted" ||
          task.state.type === "failed" ||
          task.state.type === "death") &&
        scope.state !== "released"
      ) {
        scope.runFinalizers()
      } else if (task.state.type === "idle") {
        scope.reset()
      }
    })
    return unsub
  }, [task, scope])

  // Dynamic code snippet based on outcome
  const codeSnippet = (() => {
    const lines = [
      "const effect = Effect.gen(function* () {",
      "  // Register finalizer first",
      '  yield* Effect.addFinalizer(() => console.log("cleanup"))',
    ]

    switch (outcome) {
      case "succeed":
        lines.push("  // Succeed", '  return "Done"')
        break
      case "fail":
        lines.push("  // Fail", '  return yield* Effect.fail("Boom")')
        break
      case "die":
        lines.push("  // Die", '  return yield* Effect.die("Defect")')
        break
      case "interrupt":
        lines.push("  // Keep running until interrupted", "  yield* Effect.sleep(60 * 60 * 1000)")
        break
    }
    lines.push("}).pipe(Effect.scoped)")
    return lines.join("\n")
  })()

  // Dark mode when effect dies
  const isDarkMode = task.state.type === "death"

  const taskHighlightMap = useMemo(
    () => ({
      effect: { text: "effect" },
    }),
    [],
  )

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={useMemo(() => [task], [task])}
      effectHighlightMap={taskHighlightMap}
      scope={scope}
      configurationPanel={<ConfigurationPanel outcome={outcome} setOutcome={setOutcome} />}
      isDarkMode={isDarkMode}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectFinalizerExample
