import { animationTokens } from "../../animationTokens"
import { TASK_COLORS } from "../../constants/colors"

// Hybrid approach: Only handle static state-based properties in variants
// Keep complex animations (jitter, pulses, flashes, dynamic sizing) imperative
export const nodeVariants = {
  idle: {
    scale: 1,
    opacity: 0.6,
    backgroundColor: TASK_COLORS.idle,
    transition: {
      // Fast color change to match original
      backgroundColor: { duration: 0.1, ease: "easeInOut" },
      // Keep spring for scale/opacity
      scale: animationTokens.springs.default,
      opacity: animationTokens.springs.default,
    },
  },

  running: {
    scale: 0.95,
    opacity: 1,
    backgroundColor: TASK_COLORS.running,
    transition: {
      backgroundColor: { duration: 0.1, ease: "easeInOut" },
      scale: animationTokens.springs.default,
      opacity: animationTokens.springs.default,
    },
  },

  completed: {
    scale: 1,
    opacity: 1,
    backgroundColor: TASK_COLORS.success,
    transition: {
      backgroundColor: { duration: 0.1, ease: "easeInOut" },
      scale: animationTokens.springs.contentScale,
      opacity: animationTokens.springs.contentScale,
    },
  },

  failed: {
    backgroundColor: TASK_COLORS.error,
    scale: 1,
    opacity: 1,
    transition: {
      backgroundColor: { duration: 0.1, ease: "easeInOut" },
      scale: animationTokens.springs.contentScale,
      opacity: animationTokens.springs.contentScale,
    },
  },

  death: {
    backgroundColor: "#991b1b",
    scale: 1,
    opacity: 1,
    transition: {
      backgroundColor: { duration: 0.1, ease: "easeInOut" },
      scale: animationTokens.springs.contentScale,
      opacity: animationTokens.springs.contentScale,
    },
  },

  interrupted: {
    backgroundColor: TASK_COLORS.interrupted,
    opacity: 1,
    scale: 1,
    transition: {
      backgroundColor: { duration: 0.1, ease: "easeInOut" },
      scale: animationTokens.springs.default,
      opacity: animationTokens.springs.default,
    },
  },
} as const

// Note: Width, height, and complex animations remain imperative
// This preserves dynamic width expansion and complex timing sequences
