import { useEffect, useReducer } from "react"
import type { VisualScope } from "../VisualScope"

export function useVisualScope(scope: VisualScope) {
  const [, forceUpdate] = useReducer(x => x + 1, 0)

  useEffect(() => {
    return scope.subscribe(forceUpdate)
  }, [scope])

  return scope
}
