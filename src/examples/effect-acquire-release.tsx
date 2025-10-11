"use client"

import { Effect } from "effect"
import { useEffect, useMemo, useRef } from "react"
import { EffectExample } from "@/components/display"
import { StringResult } from "@/components/renderers"
import { useVisualScope } from "@/hooks/useVisualScope"
import type { ExampleComponentProps } from "@/lib/example-types"
import { useVisualEffectState, visualEffect } from "@/VisualEffect"
import { VisualScope } from "@/VisualScope"
import { getDelay } from "./helpers"

// Simulate resource acquisition with cleanup
function acquireDatabase() {
  return Effect.gen(function* () {
    yield* Effect.sleep(getDelay(600, 900))
    return {
      connection: "DATABASE",
      close: () => console.log("Database connection closed"),
    }
  })
}

function acquireCache() {
  return Effect.gen(function* () {
    yield* Effect.sleep(getDelay(600, 900))
    return {
      connection: "CACHE",
      close: () => console.log("Cache connection closed"),
    }
  })
}

function acquireLogger() {
  return Effect.gen(function* () {
    yield* Effect.sleep(getDelay(600, 900))
    return {
      file: "LOGGER",
      close: () => console.log("Logger file closed"),
    }
  })
}

export function EffectAcquireReleaseExample({ exampleId, index, metadata }: ExampleComponentProps) {
  const scope = useMemo(() => new VisualScope("resourceScope"), [])
  const runCountRef = useRef(0)
  useVisualScope(scope)

  // Individual resource tasks
  const dbTask = useMemo(
    () =>
      visualEffect(
        "database",
        acquireDatabase().pipe(
          Effect.map(db => new StringResult(db.connection)),
          Effect.tap(() => scope.addFinalizer("Close database")),
          Effect.tap(() => Effect.sleep(200)),
        ),
      ),
    [scope],
  )

  const cacheTask = useMemo(
    () =>
      visualEffect(
        "cache",
        acquireCache().pipe(
          Effect.map(cache => new StringResult(cache.connection)),
          Effect.tap(() => scope.addFinalizer("Flush cache")),
          Effect.tap(() => Effect.sleep(200)),
        ),
      ),
    [scope],
  )

  const loggerTask = useMemo(
    () =>
      visualEffect(
        "logger",
        acquireLogger().pipe(
          Effect.map(logger => new StringResult(logger.file)),
          Effect.tap(() => scope.addFinalizer("Close log file")),
          Effect.tap(() => Effect.sleep(200)),
        ),
      ),
    [scope],
  )

  // Main effect that uses scoped resources
  const mainTask = useMemo(() => {
    const scopedEffect = Effect.gen(function* () {
      // Increment run count
      runCountRef.current += 1
      const currentRun = runCountRef.current

      // Simulate scope acquisition
      scope.setState("acquiring")

      // Acquire resources in order
      yield* dbTask.effect

      yield* cacheTask.effect

      yield* loggerTask.effect

      scope.setState("active")

      // Do some work with resources
      yield* Effect.sleep(getDelay(1000, 1500))

      // Cycle through success, failure, and death
      const cyclePosition = (currentRun - 1) % 3

      if (cyclePosition === 0) {
        // First run: succeed
        return new StringResult("Work completed!")
      } else if (cyclePosition === 1) {
        // Second run: fail
        return yield* Effect.fail("Oops.")
      } else {
        // Third run: die
        return yield* Effect.die("BANG!")
      }
    })

    return visualEffect("result", scopedEffect)
  }, [dbTask, cacheTask, loggerTask, scope])

  // Handle scope cleanup when main task completes
  useEffect(() => {
    const unsubscribe = mainTask.subscribe(() => {
      if (
        (mainTask.state.type === "completed" ||
          mainTask.state.type === "interrupted" ||
          mainTask.state.type === "failed" ||
          mainTask.state.type === "death") &&
        scope.state !== "released"
      ) {
        // Run finalizers (guaranteed cleanup!)
        scope.runFinalizers()
      } else if (mainTask.state.type === "idle") {
        // Reset scope when task resets
        scope.reset()
      }
    })

    return unsubscribe
  }, [mainTask, scope])

  const codeSnippet = `
const makeDatabase = Effect.acquireRelease(
  connectDatabase(),
  (db) => Effect.sync(() => db.close())
);

const makeCache = Effect.acquireRelease(
  connectCache(),
  (cache) => Effect.sync(() => cache.flush())
);

const makeLogger = Effect.acquireRelease(
  openLogFile(),
  (file) => Effect.sync(() => file.close())
);

const result = Effect.gen(function* () {
  const db = yield* makeDatabase
  const cache = yield* makeCache
  const logger = yield* makeLogger
  return yield* doWork(db, cache, logger)
})
.pipe(Effect.scoped)`

  const taskHighlightMap = useMemo(
    () => ({
      database: { text: "makeDatabase" },
      cache: { text: "makeCache" },
      logger: { text: "makeLogger" },
      result: { text: "result" },
    }),
    [],
  )

  // Subscribe to main task state changes
  const mainTaskState = useVisualEffectState(mainTask)

  // Set dark mode when the main task dies
  const isDarkMode = mainTaskState.type === "death"

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={useMemo(() => [dbTask, cacheTask, loggerTask], [dbTask, cacheTask, loggerTask])}
      resultEffect={mainTask}
      effectHighlightMap={taskHighlightMap}
      scope={scope}
      isDarkMode={isDarkMode}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectAcquireReleaseExample
