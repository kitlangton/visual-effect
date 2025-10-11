// Design tokens
export const theme = {
  colors: {
    bg: "#000000",
    surface: "#141414",
    surfaceSecondary: "#0a0a0a",
    surfaceHover: "#1a1a1a",

    // Task colors
    idle: "linear-gradient(135deg, #475569 0%, #334155 100%)", // Slate grey
    running: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", // Bright blue
    success: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)", // Even darker green for dark mode
    error: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)", // Coral red
    warning: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", // Amber orange

    // Text
    textPrimary: "#ffffff",
    textSecondary: "#a3a3a3",
    textMuted: "#525252",

    // Progress
    progressTrack: "rgba(255, 255, 255, 0.05)",
    progressFill: "rgba(255, 255, 255, 0.9)",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },

  shadow: {
    sm: "0 2px 4px rgba(0,0,0,0.4)",
    md: "0 4px 12px rgba(0,0,0,0.5)",
    lg: "0 8px 24px rgba(0,0,0,0.6)",
    glow: "0 0 20px rgba(59, 130, 246, 0.5)",
  },

  animation: {
    spring: {
      type: "spring" as const,
      stiffness: 180,
      damping: 25,
      mass: 0.8,
    },
    bouncy: {
      type: "spring" as const,
      bounce: 0.3,
      visualDuration: 0.5,
    },
  },
}
