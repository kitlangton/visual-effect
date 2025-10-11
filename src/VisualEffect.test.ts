import { Effect } from "effect"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { VisualEffect } from "./VisualEffect"

describe("VisualEffect State Transitions", () => {
  let task: VisualEffect<string, string>
  let stateChanges: Array<{ from: string; to: string; timestamp: number }> = []

  beforeEach(() => {
    stateChanges = []
    // Don't use fake timers by default - many tests need real async behavior
  })

  afterEach(() => {
    vi.useRealTimers()
    task?.reset()
  })

  const createTask = (effect: Effect.Effect<string, string>) => {
    const visualTask = new VisualEffect("test", effect)

    // Track all state changes
    visualTask.subscribe(() => {
      const currentState = visualTask.state
      const timestamp = Date.now()

      if (stateChanges.length > 0) {
        const lastState = stateChanges[stateChanges.length - 1]
        stateChanges.push({
          from: lastState?.to ?? "initial",
          to: currentState.type,
          timestamp,
        })
      } else {
        stateChanges.push({
          from: "initial",
          to: currentState.type,
          timestamp,
        })
      }
    })

    return visualTask
  }

  describe("Basic State Transitions", () => {
    it("should start in idle state", () => {
      task = createTask(Effect.succeed("test"))
      expect(task.state.type).toBe("idle")
    })

    it("should transition idle -> running -> completed for successful effect", async () => {
      // Use an effect that takes time so we can observe the running state
      task = createTask(Effect.sleep(50).pipe(Effect.map(() => "success")))

      const promise = Effect.runPromise(task.effect)

      // Should be running now
      expect(task.state.type).toBe("running")

      const result = await promise
      expect(result).toBe("success")
      expect(task.state.type).toBe("completed")

      if (task.state.type === "completed") {
        expect(task.state.result).toBe("success")
      }
    })

    it("should transition idle -> running -> failed for failing effect", async () => {
      // Use an effect that takes time before failing
      task = createTask(Effect.sleep(50).pipe(Effect.flatMap(() => Effect.fail("error"))))

      try {
        await Effect.runPromise(task.effect)
      } catch (error: unknown) {
        if (error instanceof Error) {
          expect(error.message).toBe("error")
        } else {
          throw error
        }
      }

      expect(task.state.type).toBe("failed")
      if (task.state.type === "failed") {
        expect(task.state.error).toBe("error")
      }
    })

    it("should transition to interrupted when effect is interrupted", async () => {
      task = createTask(Effect.sleep(1000).pipe(Effect.map(() => "never")))

      const runPromise = task.run()
      expect(task.state.type).toBe("running")

      // Interrupt the task
      task.interrupt()

      try {
        await runPromise
      } catch {
        // Expected to throw
      }

      expect(task.state.type).toBe("interrupted")
    })
  })

  describe("Reset Behavior", () => {
    it("should reset from completed to idle", async () => {
      task = createTask(Effect.succeed("done"))

      await Effect.runPromise(task.effect)
      expect(task.state.type).toBe("completed")

      task.reset()
      expect(task.state.type).toBe("idle")
    })

    it("should reset from failed to idle", async () => {
      task = createTask(Effect.fail("error"))

      try {
        await Effect.runPromise(task.effect)
      } catch {
        // Expected to throw
      }

      expect(task.state.type).toBe("failed")

      task.reset()
      expect(task.state.type).toBe("idle")
    })

    it("should reset from running to idle (interrupt case)", async () => {
      task = createTask(Effect.sleep(1000).pipe(Effect.map(() => "slow")))

      const promise = Effect.runPromise(task.effect)
      expect(task.state.type).toBe("running")

      task.reset()
      expect(task.state.type).toBe("idle")

      try {
        await promise
      } catch {
        // Expected to throw due to interruption
      }

      // Should stay idle after interruption completes
      expect(task.state.type).toBe("idle")
    })

    it("should prevent interrupted state during reset", async () => {
      task = createTask(Effect.sleep(1000).pipe(Effect.map(() => "slow")))

      Effect.runPromise(task.effect)
      expect(task.state.type).toBe("running")

      // Reset should prevent "interrupted" state
      task.reset()

      // Even if async interruption happens, should stay idle
      await vi.waitFor(() => {
        expect(task.state.type).toBe("idle")
      })

      // Verify no interrupted state in history
      const hasInterrupted = stateChanges.some(change => change.to === "interrupted")
      expect(hasInterrupted).toBe(false)
    })
  })

  describe("Effect Caching", () => {
    it("should return cached result for completed effects", async () => {
      let executionCount = 0
      const countingEffect = Effect.sync(() => {
        executionCount++
        return `execution-${executionCount}`
      })

      task = createTask(countingEffect)

      // First execution
      const result1 = await Effect.runPromise(task.effect)
      expect(result1).toBe("execution-1")
      expect(executionCount).toBe(1)

      // Second call should return cached result
      const result2 = await Effect.runPromise(task.effect)
      expect(result2).toBe("execution-1") // Same result
      expect(executionCount).toBe(1) // No additional execution
    })

    it("should re-execute after reset", async () => {
      let executionCount = 0
      const countingEffect = Effect.sync(() => {
        executionCount++
        return `execution-${executionCount}`
      })

      task = createTask(countingEffect)

      // First execution
      await Effect.runPromise(task.effect)
      expect(executionCount).toBe(1)

      // Reset and execute again
      task.reset()
      const result2 = await Effect.runPromise(task.effect)
      expect(result2).toBe("execution-2")
      expect(executionCount).toBe(2)
    })
  })

  describe("Parent-Child Relationships", () => {
    it("should register child effects and reset them when parent is reset", async () => {
      const childStates: Array<string> = []

      // Create a child effect that tracks its state changes
      const childEffect = Effect.gen(function* () {
        const child = createTask(Effect.sleep(1000).pipe(Effect.map(() => "child-done")))

        // Track child state changes
        child.subscribe(() => {
          childStates.push(child.state.type)
        })

        // Run the child as part of the parent's effect
        // This will make it register with the parent via VisualEffectService
        const childResult = yield* child.effect

        return childResult
      })

      const parent = createTask(
        Effect.gen(function* () {
          console.log("Parent starting")
          const result = yield* childEffect
          console.log("Parent finishing")
          return result
        }),
      )

      // Start the parent
      const parentPromise = parent.run()
      expect(parent.state.type).toBe("running")

      // Wait for the child to enter running state
      await vi.waitFor(() => {
        expect(childStates).toContain("running")
      })

      // Reset the parent - this should cascade to children
      parent.reset()
      expect(parent.state.type).toBe("idle")

      try {
        await parentPromise
      } catch {
        // Expected to throw due to interruption
      }

      // Child should have been reset too (transitioned to idle)
      expect(childStates).toContain("running")
      expect(childStates).toContain("idle")

      // Verify child ended up in idle state
      const finalChildState = childStates[childStates.length - 1]
      expect(finalChildState).toBe("idle")
    })

    it("should interrupt child effects when parent is interrupted", async () => {
      const childStates: Array<string> = []

      // Create a child effect that tracks its state changes
      const childEffect = Effect.gen(function* () {
        const child = createTask(Effect.sleep(1000).pipe(Effect.map(() => "child-done")))

        // Track child state changes
        child.subscribe(() => {
          childStates.push(child.state.type)
        })

        // Run the child as part of the parent's effect
        // This ensures it gets registered with the parent
        return yield* child.effect
      })

      const parent = createTask(childEffect)

      // Start the parent
      const parentPromise = parent.run()
      expect(parent.state.type).toBe("running")

      // Wait for child running
      await vi.waitFor(() => {
        expect(childStates).toContain("running")
      })

      // Interrupt the parent - this should cascade to children
      parent.interrupt()
      expect(parent.state.type).toBe("interrupted")

      try {
        await parentPromise
      } catch {
        // Expected to throw due to interruption
      }

      // Child should have been interrupted too
      expect(childStates).toContain("running")
      expect(childStates).toContain("interrupted")
    })
  })
})
