/**
 * RetryTimelinePattern - Complete retry visualization
 * Shows multiple retry attempts with increasing gaps (exponential backoff)
 */

import { motion } from "motion/react"
import { useState } from "react"
import { TimelineSegmentPattern } from "./TimelineSegmentPattern"
import { TimelineTicksPattern } from "./TimelineTicksPattern"

export interface RetryAttempt {
  attemptDuration: number // How long the attempt ran
  delayAfter?: number // Delay before next attempt
  failed?: boolean
}

export interface RetryTimelinePatternProps {
  attempts: RetryAttempt[]
  pixelsPerSecond?: number
  height?: number
  showTicks?: boolean
  className?: string
}

const DEFAULT_PIXELS_PER_SECOND = 100
const DEFAULT_HEIGHT = 80
const SEGMENT_Y = "50%"
const LINE_HEIGHT = 3
const DOT_SIZE = 12

const COLORS = {
  attempt: "var(--color-blue-500)",
  gap: "var(--color-neutral-500)",
  failed: "var(--color-red-500)",
}

export function RetryTimelinePattern({
  attempts,
  pixelsPerSecond = DEFAULT_PIXELS_PER_SECOND,
  height = DEFAULT_HEIGHT,
  showTicks = true,
  className = "",
}: RetryTimelinePatternProps) {
  // Calculate segment positions
  let currentX = 50 // Start offset
  const segments: Array<{
    type: "attempt" | "gap"
    startX: number
    endX: number
    duration: number
    failed?: boolean
  }> = []
  type SegmentKey = `${number}-${"attempt" | "gap"}`

  for (const attempt of attempts) {
    // Attempt segment
    const attemptWidth = (attempt.attemptDuration / 1000) * pixelsPerSecond
    segments.push({
      type: "attempt",
      startX: currentX,
      endX: currentX + attemptWidth,
      duration: attempt.attemptDuration,
      failed: attempt.failed,
    })
    currentX += attemptWidth

    // Gap segment (if there's a delay after this attempt)
    if (attempt.delayAfter !== undefined) {
      const gapWidth = (attempt.delayAfter / 1000) * pixelsPerSecond
      segments.push({
        type: "gap",
        startX: currentX,
        endX: currentX + gapWidth,
        duration: attempt.delayAfter,
      })
      currentX += gapWidth
    }
  }

  const totalWidth = currentX + 100 // Add padding at the end

  return (
    <div
      className={`overflow-x-auto ${className}`}
      style={{ height: `${height}px`, width: "100%" }}
    >
      <div
        className="relative"
        style={{ height: `${height}px`, width: `${totalWidth}px`, minWidth: `${totalWidth}px` }}
      >
        {/* Background ticks */}
        {showTicks && <TimelineTicksPattern width={totalWidth} height={height} />}

        {/* Background line */}
        <div
          className="absolute"
          style={{
            width: `${totalWidth}px`,
            height: `${LINE_HEIGHT}px`,
            top: SEGMENT_Y,
            transform: "translateY(-50%)",
            backgroundColor: "var(--color-neutral-800)",
          }}
        />

        {/* Segments */}
        {segments.map((segment, i) => {
          const key: SegmentKey = `${i}-${segment.type}`
          if (segment.type === "attempt") {
            const color = segment.failed ? COLORS.failed : COLORS.attempt
            return (
              <TimelineSegmentPattern
                key={key}
                startX={segment.startX}
                endX={segment.endX}
                y={SEGMENT_Y}
                lineHeight={LINE_HEIGHT}
                dotSize={DOT_SIZE}
                color={color}
                state="complete"
                showDots={true}
                showDuration={false}
              />
            )
          } else {
            // Gap segment
            return (
              <TimelineSegmentPattern
                key={key}
                startX={segment.startX}
                endX={segment.endX}
                y={SEGMENT_Y}
                lineHeight={LINE_HEIGHT}
                dotSize={DOT_SIZE}
                color={COLORS.gap}
                state="complete"
                showDots={false}
                showDuration={true}
                duration={segment.duration}
              />
            )
          }
        })}

        {/* Terminator bar at the end */}
        <motion.div
          className="absolute"
          style={{
            left: `${currentX}px`,
            top: SEGMENT_Y,
            transform: "translateY(-50%)",
            width: "3px",
            height: "30px",
            backgroundColor: "var(--color-white)",
          }}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{
            delay: 0.5,
            duration: 0.3,
            ease: "easeOut",
          }}
        />
      </div>
    </div>
  )
}

/**
 * Interactive retry timeline demo with controls
 */
export interface InteractiveRetryTimelineDemoProps {
  className?: string
}

export function InteractiveRetryTimelineDemo({
  className = "",
}: InteractiveRetryTimelineDemoProps) {
  const [retryCount, setRetryCount] = useState(3)
  const [delayType, setDelayType] = useState<"exponential" | "fixed">("exponential")
  const [baseDelay, setBaseDelay] = useState(500)
  const [isRunning, setIsRunning] = useState(false)
  const [currentAttempts, setCurrentAttempts] = useState<RetryAttempt[]>([])

  const handleStart = () => {
    setIsRunning(true)
    const attempts: RetryAttempt[] = []

    // Initial failed attempt
    attempts.push({
      attemptDuration: 200,
      delayAfter: baseDelay,
      failed: true,
    })

    // Retry attempts
    for (let i = 0; i < retryCount; i++) {
      const delay = delayType === "exponential" ? baseDelay * 2 ** i : baseDelay

      const isLastAttempt = i === retryCount - 1
      attempts.push({
        attemptDuration: 200,
        delayAfter: isLastAttempt ? undefined : delay,
        failed: !isLastAttempt, // Last attempt succeeds
      })
    }

    setCurrentAttempts(attempts)
  }

  const handleReset = () => {
    setIsRunning(false)
    setCurrentAttempts([])
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleStart}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded"
          >
            Start Retry Sequence
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-neutral-600 hover:bg-neutral-700 rounded"
          >
            Reset
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm text-neutral-400">Retries:</label>
          <input
            type="number"
            min={1}
            max={5}
            value={retryCount}
            onChange={e => setRetryCount(Number.parseInt(e.target.value, 10))}
            disabled={isRunning}
            className="w-16 px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-sm disabled:opacity-50"
          />
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm text-neutral-400">Delay:</label>
          <select
            value={delayType}
            onChange={e => setDelayType(e.target.value as "exponential" | "fixed")}
            disabled={isRunning}
            className="px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-sm disabled:opacity-50"
          >
            <option value="exponential">Exponential</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm text-neutral-400">Base delay (ms):</label>
          <input
            type="number"
            min={100}
            max={2000}
            step={100}
            value={baseDelay}
            onChange={e => setBaseDelay(Number.parseInt(e.target.value, 10))}
            disabled={isRunning}
            className="w-20 px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-sm disabled:opacity-50"
          />
        </div>
      </div>

      {/* Timeline */}
      {currentAttempts.length > 0 && (
        <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-900/50">
          <RetryTimelinePattern attempts={currentAttempts} />
        </div>
      )}

      {/* Status */}
      <div className="text-sm text-neutral-400 font-mono">
        {isRunning ? `Running ${retryCount} retries with ${delayType} backoff` : "Ready to start"}
      </div>
    </div>
  )
}
