/**
 * TimelineSegmentPattern - Single timeline segment (line with start/end dots)
 * Shows duration label above the segment
 */

import { motion } from "motion/react"
import { TimelineDotPattern } from "./TimelineDotPattern"

export interface TimelineSegmentPatternProps {
  startX: number
  endX: number
  y?: string
  lineHeight?: number
  color?: string
  dotSize?: number
  showDots?: boolean
  showDuration?: boolean
  duration?: number
  state?: "idle" | "active" | "complete"
  className?: string
}

const DEFAULT_Y = "50%"
const DEFAULT_LINE_HEIGHT = 3
const DEFAULT_DOT_SIZE = 12
const DEFAULT_COLORS = {
  idle: "var(--color-neutral-500)",
  active: "var(--color-blue-400)",
  complete: "var(--color-blue-500)",
}

function formatTime(ms: number): string {
  return `${ms}ms`
}

export function TimelineSegmentPattern({
  startX,
  endX,
  y = DEFAULT_Y,
  lineHeight = DEFAULT_LINE_HEIGHT,
  color,
  dotSize = DEFAULT_DOT_SIZE,
  showDots = true,
  showDuration = false,
  duration,
  state = "idle",
  className = "",
}: TimelineSegmentPatternProps) {
  const width = endX - startX
  const segmentColor = color || DEFAULT_COLORS[state]
  const midX = startX + width / 2

  return (
    <div className={`relative ${className}`}>
      {/* Line */}
      <motion.div
        className="absolute"
        style={{
          left: `${startX}px`,
          top: y,
          transform: "translateY(-50%)",
          height: `${lineHeight}px`,
        }}
        initial={{ width: 0 }}
        animate={{
          width: `${width}px`,
          backgroundColor: segmentColor,
        }}
        transition={{
          width: { duration: 0.3, ease: "easeOut" },
          backgroundColor: { duration: 0.3, ease: "easeOut" },
        }}
      />

      {/* Start dot */}
      {showDots && (
        <TimelineDotPattern x={startX} y={y} size={dotSize} color={segmentColor} state={state} />
      )}

      {/* End dot */}
      {showDots && (
        <TimelineDotPattern x={endX} y={y} size={dotSize} color={segmentColor} state={state} />
      )}

      {/* Duration label */}
      {showDuration && duration !== undefined && width > 50 && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${midX}px`,
            top: y,
            transform: "translate(-50%, -150%)",
          }}
        >
          <motion.div
            className="bg-neutral-900/90 px-2 py-0.5 rounded text-xs font-mono text-neutral-300 border border-neutral-700 whitespace-nowrap"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {formatTime(duration)}
          </motion.div>
        </div>
      )}
    </div>
  )
}
