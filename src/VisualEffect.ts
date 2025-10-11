"use client"

import { Context, Effect, Fiber, Option } from "effect"
import { useSyncExternalStore } from "react"
import { taskSounds } from "./sounds/TaskSounds"

export type EffectState<A, E> =
  | { type: "idle" }
  | { type: "running" }
  | { type: "completed"; result: A }
  | { type: "failed"; error: E }
  | { type: "interrupted" }
  | { type: "death"; error: unknown }

// Pattern matching helper for EffectState
export const matchEffectState = <A, E, T>(
  state: EffectState<A, E>,
  cases: {
    idle: () => T
    running: () => T
    completed: (result: A) => T
    failed: (error: E) => T
    interrupted: () => T
    death: (error: unknown) => T
  },
): T => {
  switch (state.type) {
    case "idle":
      return cases.idle()
    case "running":
      return cases.running()
    case "completed":
      return cases.completed(state.result)
    case "failed":
      return cases.failed(state.error)
    case "interrupted":
      return cases.interrupted()
    case "death":
      return cases.death(state.error)
  }
}

export interface Notification {
  id: string
  message: string
  timestamp: number
  duration?: number // auto-dismiss after this many ms
  icon?: string // emoji or icon
}

// Valid state transitions for the state machine
const VALID_TRANSITIONS: Record<string, Set<string>> = {
  idle: new Set(["running", "idle"]),
  running: new Set(["completed", "failed", "interrupted", "death", "idle", "running"]),
  completed: new Set(["idle", "running", "completed"]),
  failed: new Set(["failed", "idle", "running"]),
  interrupted: new Set(["interrupted", "idle", "running"]),
  death: new Set(["death", "idle", "running"]),
}

// Service interface for parent-child VisualEffect communication
export interface VisualEffectService {
  readonly addChild: (child: VisualEffect<unknown, unknown>) => Effect.Effect<void>
  readonly notify: (
    message: string,
    options?: { duration?: number; icon?: string },
  ) => Effect.Effect<void>
}

const VisualEffectService = Context.GenericTag<VisualEffectService>("VisualEffectService")

// Service implementation
class VisualEffectServiceImpl implements VisualEffectService {
  constructor(private parent: VisualEffect<unknown, unknown>) {}

  addChild = (child: VisualEffect<unknown, unknown>): Effect.Effect<void> =>
    Effect.sync(() => {
      this.parent.addChildEffect(child)
    })

  notify = (message: string, options?: { duration?: number; icon?: string }): Effect.Effect<void> =>
    Effect.sync(() => {
      this.parent.notify(message, options)
    })
}

export class VisualEffect<A, E = never> {
  private listeners = new Set<() => void>()
  private notificationListeners = new Set<() => void>()
  private currentNotification: Notification | null = null
  private fiber: Fiber.RuntimeFiber<A, E> | null = null
  private timeouts = new Set<ReturnType<typeof setTimeout>>()
  private isResetting = false
  private children = new Set<VisualEffect<unknown, unknown>>()

  state: EffectState<A, E> = { type: "idle" }

  addChildEffect(child: VisualEffect<unknown, unknown>): void {
    this.children.add(child)
  }

  startTime: number | null = null
  endTime: number | null = null

  constructor(
    public name: string,
    private _effect: Effect.Effect<A, E>,
    public showTimer: boolean = false,
  ) {}

  // The effect property returns an Effect that updates this effect's state when run
  get effect(): Effect.Effect<A, E> {
    // Quick return for terminal states
    const quickReturn = matchEffectState(this.state, {
      idle: () => null,
      running: () => null,
      completed: result => Effect.succeed(result),
      failed: error => Effect.fail(error) as Effect.Effect<A, E>,
      interrupted: () => null,
      death: error => Effect.die(error),
    })

    if (quickReturn) return quickReturn

    // Create the effect
    return Effect.gen(
      function* (this: VisualEffect<A, E>) {
        // Register with parent service if available
        const maybeParentService = yield* Effect.serviceOption(VisualEffectService)
        yield* Option.match(maybeParentService, {
          onNone: () => Effect.void,
          onSome: service => service.addChild(this),
        })

        // Mark as running
        this.setState({ type: "running" })

        // Execute the wrapped effect with appropriate service provided to all nested effects
        const effectWithRootService = this._effect.pipe(
          Effect.provideService(VisualEffectService, new VisualEffectServiceImpl(this)),
        )

        const wrappedEffect = Option.isSome(maybeParentService)
          ? this._effect
          : effectWithRootService

        return yield* wrappedEffect
      }.bind(this),
    ).pipe(
      // Clear notifications on any non-success exit
      Effect.tapErrorCause(() => Effect.sync(() => this.clearNotifications())),
      // Handle success
      Effect.tap(result =>
        Effect.sync(() => {
          this.setState({ type: "completed", result })
        }),
      ),
      // Handle errors
      Effect.tapError((error: E) =>
        Effect.sync(() => {
          this.setState({ type: "failed", error })
        }),
      ),
      // Handle interruption
      Effect.onInterrupt(() =>
        Effect.sync(() => {
          if (!this.isResetting) {
            this.setState({ type: "interrupted" })
          }
        }),
      ),
      // Handle defects
      Effect.tapDefect((defect: unknown) =>
        Effect.sync(() => {
          if (process.env.NODE_ENV === "development") {
            console.error(`Effect "${this.name}" died with defect:`, defect)
          }
          this.setState({ type: "death", error: defect })
        }),
      ),
    ) as Effect.Effect<A, E>
  }

  // Observable pattern methods
  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  subscribeToNotifications(listener: () => void) {
    this.notificationListeners.add(listener)
    return () => {
      this.notificationListeners.delete(listener)
    }
  }

  notify(message: string, options?: { duration?: number; icon?: string }): void {
    // Clear any existing notification and its timeout
    this.clearNotifications()

    const notification: Notification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      message,
      timestamp: Date.now(),
      duration: options?.duration ?? 2000, // default 2 seconds
      ...(options?.icon && { icon: options.icon }),
    }

    this.currentNotification = notification
    this.notifyNotificationListeners()

    // Auto-remove after duration
    if (notification.duration) {
      const timeoutId = setTimeout(() => {
        this.clearNotifications()
      }, notification.duration)
      this.timeouts.add(timeoutId)
    }
  }

  getCurrentNotification(): Notification | null {
    return this.currentNotification
  }

  private clearNotifications(): void {
    this.currentNotification = null
    this.clearTimeouts()
    this.notifyNotificationListeners()
  }

  private notifyStateListeners() {
    this.listeners.forEach(l => l())
  }

  private notifyNotificationListeners() {
    this.notificationListeners.forEach(l => l())
  }

  private setState(newState: EffectState<A, E>) {
    if (this.isResetting) return

    const previousState = this.state
    const validTransitions = VALID_TRANSITIONS[previousState.type]

    if (!validTransitions?.has(newState.type)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `Invalid state transition from ${previousState.type} to ${newState.type} for task ${this.name}`,
        )
      }
      return
    }

    this.state = newState

    // Track timing
    if (this.showTimer) {
      if (newState.type === "running" && previousState.type !== "running") {
        this.startTime = Date.now()
        this.endTime = null
      } else if (previousState.type === "running" && newState.type !== "running") {
        this.endTime = Date.now()
      }
    }

    // Trigger sounds
    if (previousState.type !== newState.type) {
      matchEffectState(newState, {
        idle: () => {},
        running: () => taskSounds.playRunning().catch(() => {}),
        completed: () => taskSounds.playSuccess().catch(() => {}),
        failed: () => taskSounds.playFailure().catch(() => {}),
        interrupted: () => taskSounds.playInterrupted().catch(() => {}),
        death: () => taskSounds.playDeath().catch(() => {}),
      })
    }

    this.notifyStateListeners()
  }

  private clearTimeouts() {
    this.timeouts.forEach(clearTimeout)
    this.timeouts.clear()
  }

  reset() {
    this.isResetting = true
    try {
      // Reset all children first so their state transitions obey the reset flag
      this.children.forEach(child => child.reset())

      // Clear the children collection since they're no longer relevant
      this.children.clear()

      // Interrupt our own fiber if it's still running
      if (this.fiber) {
        Effect.runFork(Fiber.interrupt(this.fiber))
        this.fiber = null
      }

      // Clean up any scheduled work / caches
      this.clearTimeouts()
      this.clearNotifications() // Clear notifications on reset
      this.startTime = null
      this.endTime = null
    } finally {
      // Allow subsequent state transitions
      this.isResetting = false
    }

    // Now that the reset flag is cleared, transition ourselves to idle
    this.setState({ type: "idle" })
  }

  async run() {
    try {
      this.fiber = Effect.runFork(this.effect)
      await Effect.runPromise(Fiber.await(this.fiber))
    } catch {
      // Error handling is done within the effect
    } finally {
      this.fiber = null
    }
  }

  interrupt() {
    if (this.state.type === "running") {
      const fiberToInterrupt = this.fiber
      this.fiber = null

      // Optimistically mark as interrupted so observers update immediately.
      // The onInterrupt handler inside the effect will confirm this later.
      this.setState({ type: "interrupted" })

      if (fiberToInterrupt) {
        Effect.runFork(Fiber.interrupt(fiberToInterrupt))
      }
    }
  }
}

// Utility function for effects to notify their parent
export const notify = (
  message: string,
  options?: { duration?: number; icon?: string },
): Effect.Effect<void, never> =>
  Effect.serviceOption(VisualEffectService).pipe(
    Effect.flatMap(option =>
      Option.isSome(option) ? option.value.notify(message, options) : Effect.void,
    ),
  )

// Granular React hooks for better performance

// Subscribe only to state changes
export function useVisualEffectState<A, E>(effect: VisualEffect<A, E>) {
  return useSyncExternalStore(effect.subscribe.bind(effect), () => effect.state)
}

// Subscribe only to notification changes
export function useVisualEffectNotification<A, E>(effect: VisualEffect<A, E>) {
  return useSyncExternalStore(effect.subscribeToNotifications.bind(effect), () =>
    effect.getCurrentNotification(),
  )
}

// Subscribe for re-renders only (no return value)
export function useVisualEffectSubscription<A, E>(effect: VisualEffect<A, E>) {
  useSyncExternalStore(effect.subscribe.bind(effect), () => effect.state)
}

// Factory function - compatible with V1 signature
export const visualEffect = <A, E = never>(
  name: string,
  effect: Effect.Effect<A, E>,
  showTimer: boolean = false,
) => new VisualEffect(name, effect, showTimer)
