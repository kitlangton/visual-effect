"use client"
import {
  ArrowCounterClockwiseIcon,
  CheckIcon,
  LinkIcon,
  PlayIcon,
  StarFourIcon,
  StopIcon,
} from "@phosphor-icons/react"
import { AnimatePresence, motion } from "motion/react"
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useState } from "react"
import { GLOW_COLORS, TASK_COLORS } from "@/constants/colors"
import { useOptionKey } from "@/hooks/useOptionKey"
import { taskSounds } from "@/sounds/TaskSounds"
import { useVisualEffectSubscription, type VisualEffect } from "@/VisualEffect"
import type { VisualRef } from "@/VisualRef"

interface HeaderViewProps<A, E> {
  effect: VisualEffect<A, E>
  name: string
  variant?: string
  description?: React.ReactNode
  refs?: Array<VisualRef<unknown>>
  exampleId: string
}

export interface HeaderViewRef {
  handleAction: () => void
}

const HeaderViewComponent = forwardRef<HeaderViewRef, HeaderViewProps<unknown, unknown>>(
  function HeaderView({ description, exampleId, name, refs = [], effect: task, variant }, ref) {
    const [isHovered, setIsHovered] = useState(false)
    const [isPressed, setIsPressed] = useState(false)
    const [showCheckmark, setShowCheckmark] = useState(false)
    const [hasPlayedHoverSound, setHasPlayedHoverSound] = useState(false)
    const isOptionPressed = useOptionKey()
    useVisualEffectSubscription(task)
    const { state } = task

    const isRunning = state.type === "running"
    const isCompleted = state.type === "completed"
    const isFailed = state.type === "failed"
    const isInterrupted = state.type === "interrupted"
    const isDeath = state.type === "death"
    const canReset = isCompleted || isFailed || isInterrupted || isDeath

    const runWithDependencies = useCallback(async () => {
      await task.run()
    }, [task])

    const resetWithDependencies = useCallback(() => {
      task.reset()
      // Also reset refs passed in
      refs.forEach(r => r.reset())
      // Play reset sound
      taskSounds.playReset()
    }, [task, refs])

    const handleAction = useCallback(() => {
      // If Option is pressed and we have an exampleId, copy link
      if (isOptionPressed && exampleId) {
        const url = `${window.location.origin}/${exampleId}`
        navigator.clipboard.writeText(url).then(() => {
          setShowCheckmark(true)
          // Play copy success sound
          taskSounds.playLinkCopied()
          // Hide checkmark after 1.5 seconds
          setTimeout(() => {
            setShowCheckmark(false)
          }, 1500)
        })
        return
      }

      const currentState = task.state
      const running = currentState.type === "running"
      const resettable =
        currentState.type === "completed" ||
        currentState.type === "failed" ||
        currentState.type === "interrupted" ||
        currentState.type === "death"

      if (running) {
        task.interrupt()
      } else if (resettable) {
        resetWithDependencies()
      } else {
        runWithDependencies()
      }
    }, [task, resetWithDependencies, runWithDependencies, isOptionPressed, exampleId])

    // Expose handleAction through ref
    useImperativeHandle(
      ref,
      () => ({
        handleAction,
      }),
      [handleAction],
    )

    const getIcon = () => {
      // Show checkmark after copying
      if (showCheckmark) {
        return (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -180, filter: "blur(10px)" }}
            animate={{ scale: 1, rotate: 0, filter: "blur(0px)" }}
            exit={{ scale: 0, rotate: 180, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <CheckIcon size={24} weight="bold" />
          </motion.div>
        )
      }

      // Show link icon when Option is pressed AND hovering
      if (isOptionPressed && isHovered && exampleId) {
        return (
          <motion.div
            key="link"
            initial={{ scale: 0, rotate: -180, filter: "blur(10px)" }}
            animate={{ scale: 1, rotate: 0, filter: "blur(0px)" }}
            exit={{ scale: 0, rotate: 180, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <LinkIcon size={24} weight="bold" />
          </motion.div>
        )
      }

      if (isHovered) {
        if (isRunning) {
          return (
            <motion.div
              key="stop"
              initial={{ scale: 0, rotate: -180, filter: "blur(10px)" }}
              animate={{ scale: 1, rotate: 0, filter: "blur(0px)" }}
              exit={{ scale: 0, rotate: 180, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <StopIcon size={24} weight="fill" />
            </motion.div>
          )
        } else if (canReset) {
          return (
            <motion.div
              key="reset"
              initial={{ scale: 0, rotate: -180, filter: "blur(10px)" }}
              animate={{ scale: 1, rotate: 0, filter: "blur(0px)" }}
              exit={{ scale: 0, rotate: 180, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <ArrowCounterClockwiseIcon size={24} weight="bold" />
            </motion.div>
          )
        } else {
          return (
            <motion.div
              key="play"
              initial={{ scale: 0, rotate: -180, filter: "blur(10px)" }}
              animate={{ scale: 1, rotate: 0, filter: "blur(0px)" }}
              exit={{ scale: 0, rotate: 180, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <PlayIcon size={24} weight="fill" />
            </motion.div>
          )
        }
      }

      return (
        <motion.div
          key="star"
          initial={{ scale: 0, filter: "blur(10px)" }}
          animate={
            isRunning
              ? { rotate: 360, scale: 1, filter: "blur(0px)" }
              : { rotate: 0, scale: 1, filter: "blur(0px)" }
          }
          exit={{ scale: 0, filter: "blur(10px)" }}
          transition={
            isRunning
              ? {
                  rotate: {
                    duration: 1,
                    repeat: Infinity,
                    ease: "circInOut",
                  },
                  scale: { type: "spring", stiffness: 300, damping: 20 },
                  filter: { type: "spring", stiffness: 300, damping: 20 },
                }
              : {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }
          }
        >
          <StarFourIcon size={24} weight="fill" />
        </motion.div>
      )
    }

    // Play hover sound effect when Option is pressed and hovering
    useEffect(() => {
      if (isOptionPressed && isHovered && exampleId && !hasPlayedHoverSound) {
        taskSounds.playLinkHover()
        setHasPlayedHoverSound(true)
      } else if (!isOptionPressed || !isHovered) {
        setHasPlayedHoverSound(false)
      }
    }, [isOptionPressed, isHovered, exampleId, hasPlayedHoverSound])

    return (
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onClick={handleAction}
        initial={{
          borderColor: "rgba(255, 255, 255, 1)",
        }}
        animate={{
          borderColor: "rgba(255, 255, 255, 0)",
        }}
        className="flex  items-center gap-4 cursor-pointer rounded-lg p-3 -m-3 px-4 -mx-4"
      >
        <motion.div
          animate={{
            scale: isPressed ? 0.95 : isHovered ? 1.05 : 1,
            background: showCheckmark
              ? "#4f46e5" // indigo-600 for success state
              : isOptionPressed && isHovered && exampleId
                ? "#6366f1" // indigo-500 for link copy mode
                : isRunning
                  ? TASK_COLORS.running
                  : isInterrupted
                    ? TASK_COLORS.interrupted
                    : isCompleted
                      ? TASK_COLORS.success
                      : isFailed
                        ? TASK_COLORS.error
                        : isDeath
                          ? "#991b1b"
                          : TASK_COLORS.idle,
          }}
          transition={{
            scale: { type: "spring", stiffness: 300, damping: 20 },
            background: { duration: 0.2, ease: "easeInOut" },
          }}
          className="w-10 h-10 rounded-md flex items-center justify-center text-white relative overflow-hidden"
        >
          <AnimatePresence mode="popLayout">{getIcon()}</AnimatePresence>

          {isRunning && (
            <motion.div
              className="absolute -inset-0.5 -z-10"
              style={{
                background: `radial-gradient(circle, ${GLOW_COLORS.running} 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Glow effect for link copy mode */}
          {isOptionPressed && isHovered && exampleId && !showCheckmark && (
            <motion.div
              className="absolute -inset-0.5 -z-10"
              style={{
                background: `radial-gradient(circle, #6366f1 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Glow effect for success checkmark */}
          {showCheckmark && (
            <motion.div
              className="absolute -inset-0.5 -z-10"
              style={{
                background: `radial-gradient(circle, #4f46e5 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.div>

        <div className="flex-1 flex flex-col">
          <h2 className="text-xl font-semibold text-white flex items-baseline gap-2">
            <span>{name}</span>
            {/* <span className="text-neutral-500"> */}
            {/* <CaretDoubleRightIcon size={16} weight="bold" /> */}
            {/* </span> */}
            {variant && <span className="font-medium text-neutral-500">{variant}</span>}
          </h2>
          {description && <p className="text-sm text-neutral-400">{description}</p>}
        </div>
      </motion.div>
    )
  },
)

export const HeaderView = memo(HeaderViewComponent)
