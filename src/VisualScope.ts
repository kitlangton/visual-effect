import { taskSounds } from "./sounds/TaskSounds"

export type ScopeState = "idle" | "acquiring" | "active" | "releasing" | "released"

export type FinalizerState = "pending" | "running" | "completed"

export interface Finalizer {
  id: string
  name: string
  timestamp: number
  state: FinalizerState
}

export class VisualScope {
  id: string
  state: ScopeState = "idle"
  finalizers: Array<Finalizer> = []
  private subscribers: Set<() => void> = new Set()

  constructor(id: string) {
    this.id = id
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  private notify() {
    this.subscribers.forEach(callback => callback())
  }

  setState(newState: ScopeState) {
    if (this.state === newState) return

    this.state = newState
    this.notify()
  }

  addFinalizer(name: string): string {
    const id = `finalizer-${name}`
    const finalizer: Finalizer = {
      id,
      name,
      timestamp: Date.now(),
      state: "pending",
    }

    this.finalizers.push(finalizer)
    taskSounds.playFinalizerCreated()

    this.notify()
    return id
  }

  async runFinalizers() {
    this.setState("releasing")

    // Run finalizers in reverse order (LIFO)
    const finalizersToRun = [...this.finalizers].reverse()

    for (const finalizer of finalizersToRun) {
      // Abort if scope was reset while releasing
      if (this.state !== "releasing") {
        return
      }

      finalizer.state = "running"
      taskSounds.playFinalizerRunning()
      this.notify()

      // Simulate finalizer execution
      await new Promise(resolve => setTimeout(resolve, 800))

      // If scope was reset during the simulated execution, abort further processing
      if (this.state !== "releasing") {
        return
      }

      finalizer.state = "completed"
      taskSounds.playFinalizerCompleted()
      this.notify()
    }

    // Only mark as released if we weren't reset in the meantime
    if (this.state === "releasing") {
      this.setState("released")
    }
  }

  reset() {
    this.state = "idle"
    this.finalizers = []
    this.notify()
  }
}
