import { SHADOW_COLORS, TASK_COLORS } from "../../constants/colors"
import { theme } from "../../theme"
import type { VisualEffect } from "../../VisualEffect"

type TaskState = VisualEffect<unknown, unknown>["state"]

export function getTaskBackground(state: TaskState): string {
  switch (state.type) {
    case "failed":
      return TASK_COLORS.error
    case "death":
      return "#991b1b"
    case "completed":
      return TASK_COLORS.success
    case "running":
      return TASK_COLORS.running
    case "interrupted":
      return TASK_COLORS.interrupted
    default:
      return TASK_COLORS.idle
  }
}

export function getTaskShadow(state: TaskState): string {
  switch (state.type) {
    case "running":
      return SHADOW_COLORS.running
    default:
      return theme.shadow.sm
  }
}
