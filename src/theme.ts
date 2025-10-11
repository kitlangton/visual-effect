// Design tokens - only the values actually used in the codebase
export const theme = {
  colors: {
    textPrimary: "#ffffff",
    textSecondary: "#a3a3a3",
    textMuted: "#525252",
  },

  spacing: {
    sm: 8,
  },

  radius: {
    md: 8,
  },

  shadow: {
    sm: "0 2px 4px rgba(0,0,0,0.4)",
  },

  animation: {
    bouncy: {
      type: "spring" as const,
      bounce: 0.3,
      visualDuration: 0.5,
    },
  },
}
