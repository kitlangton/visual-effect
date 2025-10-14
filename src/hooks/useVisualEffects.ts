import type { Effect } from "effect"
import { type DependencyList, useMemo } from "react"
import { type VisualEffect, visualEffect } from "@/VisualEffect"

export interface UseVisualEffectOptions<A, E> {
  showTimer?: boolean
  deps?: DependencyList
  create: () => Effect.Effect<A, E>
}

type VisualEffectDefinition<A, E> = (() => Effect.Effect<A, E>) | UseVisualEffectOptions<A, E>

type VisualEffectForDefinition<D> = D extends () => Effect.Effect<infer A, infer E>
  ? VisualEffect<A, E>
  : D extends UseVisualEffectOptions<infer A, infer E>
    ? VisualEffect<A, E>
    : never

export function useVisualEffect<A, E>(
  name: string,
  create: () => Effect.Effect<A, E>,
  options: Omit<UseVisualEffectOptions<A, E>, "create"> = {},
): VisualEffect<A, E> {
  const { showTimer = false, deps = [] } = options
  return useMemo(() => visualEffect(name, create(), showTimer), deps)
}

export function useVisualEffects<T extends Record<string, VisualEffectDefinition<any, any>>>(
  definitions: T,
  deps: DependencyList = [],
): { [K in keyof T]: VisualEffectForDefinition<T[K]> } {
  const entries = Object.entries(definitions) as Array<[keyof T, VisualEffectDefinition<any, any>]>

  const dependencyBag: unknown[] = [...deps]
  for (const [, definition] of entries) {
    if (typeof definition !== "function" && definition.deps) {
      dependencyBag.push(...definition.deps)
    }
  }

  return useMemo(() => {
    const effects = {} as { [K in keyof T]: VisualEffectForDefinition<T[K]> }

    for (const [key, definition] of entries) {
      const { create, showTimer = false } =
        typeof definition === "function" ? { create: definition, showTimer: false } : definition

      const effectName = String(key)
      effects[key] = visualEffect(effectName, create(), showTimer) as VisualEffectForDefinition<
        T[typeof key]
      >
    }

    return effects
  }, dependencyBag as DependencyList)
}
