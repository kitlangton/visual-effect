import { useEffect, useRef } from "react"
import type { EffectState } from "../VisualEffect"

export interface StateTransition<A, E> {
  justStarted: boolean
  justCompleted: boolean
  justFailed: boolean
  justInterrupted: boolean
  previousState: EffectState<A, E>["type"]
  currentState: EffectState<A, E>["type"]
}

export function useStateTransition<A, E>(state: EffectState<A, E>): StateTransition<A, E> {
  const prevStateRef = useRef<EffectState<A, E>["type"]>(state.type)
  const currentState = state.type
  const previousState = prevStateRef.current

  useEffect(() => {
    prevStateRef.current = currentState
  }, [currentState])

  return {
    justStarted: previousState !== "running" && currentState === "running",
    justCompleted: previousState !== "completed" && currentState === "completed",
    justFailed: previousState !== "failed" && currentState === "failed",
    justInterrupted: previousState !== "interrupted" && currentState === "interrupted",
    previousState,
    currentState,
  }
}
