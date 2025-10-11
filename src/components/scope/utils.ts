import type { VisualScope } from "../../VisualScope"

export function isActive(state: VisualScope["state"]) {
  return state === "active" || state === "acquiring"
}

export function isReleasing(state: VisualScope["state"]) {
  return state === "releasing"
}

export function getStateColor(state: VisualScope["state"]) {
  if (state === "idle") return "slate"
  if (isActive(state)) return "blue"
  if (isReleasing(state)) return "orange"
  return "green"
}

export function getStateBackgroundColor(state: VisualScope["state"]) {
  if (isReleasing(state)) return "rgba(251, 146, 60, 0.05)"
  if (isActive(state)) return "rgba(59, 130, 246, 0.03)"
  return "transparent"
}
