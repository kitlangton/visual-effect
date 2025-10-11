"use client"

import { Effect, Ref } from "effect"
import { useMemo, useSyncExternalStore } from "react"
import { taskSounds } from "./sounds/TaskSounds"

export class VisualRef<A> {
  private listeners = new Set<() => void>()
  private _ref: Ref.Ref<A> | null = null
  private _currentValue: A
  private _justChanged = false
  private animationTimeoutId: ReturnType<typeof setTimeout> | null = null

  constructor(
    public name: string,
    private initialValue: A,
  ) {
    this._currentValue = initialValue
  }

  get ref(): Effect.Effect<Ref.Ref<A>, never> {
    if (this._ref) return Effect.succeed(this._ref)
    
    return Ref.make(this.initialValue).pipe(
      Effect.tap(ref => Effect.sync(() => {
        this._ref = ref
      }))
    )
  }

  get value(): A {
    return this._currentValue
  }

  get justChanged(): boolean {
    return this._justChanged
  }

  updateValue(newValue: A): void {
    if (this._currentValue === newValue) return
    
    // Play sound
    taskSounds.playRefUpdate().catch(() => {})
    
    // Update state
    this._currentValue = newValue
    this._justChanged = true
    
    // Clear existing timeout
    if (this.animationTimeoutId) {
      clearTimeout(this.animationTimeoutId)
    }
    
    // Schedule animation cleanup
    this.animationTimeoutId = setTimeout(() => {
      this._justChanged = false
      this.notify()
      this.animationTimeoutId = null
    }, 50)
    
    this.notify()
  }

  updateAndGet(updateFn: (current: A) => A): Effect.Effect<A> {
    return this.ref.pipe(
      Effect.flatMap(ref => Ref.updateAndGet(ref, updateFn)),
      Effect.tap(newValue => Effect.sync(() => this.updateValue(newValue)))
    )
  }

  get(): Effect.Effect<A> {
    return this.ref.pipe(
      Effect.flatMap(Ref.get)
    )
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    for (const listener of this.listeners) {
      listener()
    }
  }

  reset() {
    // Clear animation timeout
    if (this.animationTimeoutId) {
      clearTimeout(this.animationTimeoutId)
      this.animationTimeoutId = null
    }
    
    // Reset state
    this._currentValue = this.initialValue
    this._justChanged = false
    this._ref = null
    
    this.notify()
  }
}

export const visualRef = <A>(name: string, initialValue: A) => new VisualRef(name, initialValue)

export function useVisualRef<A>(ref: VisualRef<A>) {
  const subscribe = useMemo(
    () => (listener: () => void) => ref.subscribe(listener), 
    [ref]
  )

  const getSnapshot = useMemo(() => {
    // Cache to avoid creating new objects on every read
    let cache = {
      value: ref.value,
      justChanged: ref.justChanged,
    }

    return () => {
      const currentValue = ref.value
      const currentFlag = ref.justChanged
      
      if (cache.value !== currentValue || cache.justChanged !== currentFlag) {
        cache = { value: currentValue, justChanged: currentFlag }
      }
      
      return cache
    }
  }, [ref])

  const snapshot = useSyncExternalStore(subscribe, getSnapshot)
  
  return {
    ref,
    value: snapshot.value,
    justChanged: snapshot.justChanged
  } as const
}
