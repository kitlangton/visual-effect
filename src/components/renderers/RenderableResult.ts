import type { ReactNode } from "react"

// Base interface for renderable results
export interface RenderableResult {
  render(): ReactNode
}

export interface RenderOptions {
  dimensions: {
    size: number
  }
}

// Type guard to check if a result is renderable
export function isRenderableResult(value: unknown): value is RenderableResult {
  return (
    value !== null &&
    typeof value === "object" &&
    "render" in value &&
    typeof (value as RenderableResult).render === "function"
  )
}

// Helper function to render any result
export function renderResult(result: unknown): ReactNode {
  if (isRenderableResult(result)) {
    return result.render()
  }

  // Default string rendering for non-renderable results
  return String(result)
}
