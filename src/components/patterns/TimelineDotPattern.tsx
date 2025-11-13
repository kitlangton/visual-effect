/**
 * TimelineDotPattern - Individual dot marker on timeline
 * Can be start, middle, or end markers with different states
 */

import { motion } from "motion/react"

export interface TimelineDotPatternProps {
  x: number
  y?: string
  size?: number
  color?: string
  state?: "idle" | "active" | "complete"
  className?: string
}

const DEFAULT_SIZE = 12
const DEFAULT_Y = "50%"
const DEFAULT_COLORS = {
  idle: "var(--color-neutral-500)",
  active: "var(--color-blue-400)",
  complete: "var(--color-blue-500)",
}

const SPRING_CONFIG = {
  type: "spring" as const,
  visualDuration: 0.5,
  bounce: 0.4,
}

export function TimelineDotPattern({
  x,
  y = DEFAULT_Y,
  size = DEFAULT_SIZE,
  color,
  state = "idle",
  className = "",
}: TimelineDotPatternProps) {
  const dotColor = color || DEFAULT_COLORS[state]
  const scale = state === "active" ? 1.2 : 1

  return (
    <motion.div
      className={`absolute rounded-full ${className}`}
      style={{
        left: `${x}px`,
        top: y,
        width: `${size}px`,
        height: `${size}px`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale,
        opacity: 1,
        backgroundColor: dotColor,
      }}
      transition={{
        scale: SPRING_CONFIG,
        opacity: SPRING_CONFIG,
        backgroundColor: { duration: 0.3, ease: "easeOut" },
      }}
    />
  )
}
