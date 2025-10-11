import { motion } from "motion/react"
import { Timer } from "@/components/Timer"
import { theme } from "@/theme"
import type { VisualEffect } from "@/VisualEffect"
import { useVisualEffectState } from "@/VisualEffect"

interface EffectLabelProps {
  effect: VisualEffect<unknown, unknown>
}

export function EffectLabel({ effect }: EffectLabelProps) {
  const state = useVisualEffectState(effect)

  return (
    <motion.div
      style={{
        marginTop: theme.spacing.sm,
        fontSize: "0.75rem",
        textAlign: "center",
        fontWeight: 500,
        color: theme.colors.textMuted,
      }}
      animate={{
        color: state.type === "idle" ? theme.colors.textMuted : theme.colors.textSecondary,
      }}
      transition={{ duration: 0.3 }}
    >
      <Timer effect={effect} />
    </motion.div>
  )
}
