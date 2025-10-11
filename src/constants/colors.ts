// Centralized color constants for task states
export const TASK_COLORS = {
  idle: "var(--color-slate-600)",
  running: "var(--color-blue-500)",
  success: "var(--color-green-700)",
  error: "#ef4444",
  interrupted: "var(--color-orange-500)",
  death: "#991b1b",
} as const

export const GLOW_COLORS = {
  running: "var(--color-blue-500)",
  success: "var(--color-green-700)",
  error: "var(--color-red-500)",
} as const

export const SHADOW_COLORS = {
  running: "0 0 24px rgba(59, 130, 246, 0.2)",
} as const
