import { SHADOW_COLORS } from "../../constants/colors"
import { theme } from "../../theme"
import type { VisualEffect } from "../../VisualEffect"

type TaskState = VisualEffect<unknown, unknown>["state"]

export function getTaskShadow(state: TaskState): string {
  switch (state.type) {
    case "running":
      return SHADOW_COLORS.running
    default:
      return theme.shadow.sm
  }
}
