"use client"

import { animate, motion, useMotionValue, useTransform } from "motion/react"
import { useEffect, useMemo } from "react"
import { animationTokens } from "@/animationTokens"

interface DeathBubbleProps {
  error: unknown
}

export function DeathBubble({ error }: DeathBubbleProps) {
  // Generate glitchy characters instead of showing the real message
  const glitchChars = useMemo(() => {
    const source = error instanceof Error ? error.message : String(error ?? "DEAD")
    const charset = "@#$%&*/=-+?!~<>\\|█▓▒░"
    return Array.from({ length: Math.max(6, Math.min(source.length, 16)) })
      .map(() => charset[Math.floor(Math.random() * charset.length)])
      .join("")
  }, [error])

  const shakeX = useMotionValue(0)
  const shakeY = useMotionValue(0)
  const rotation = useMotionValue(0)

  // Re-use the same shake behaviour as FailureBubble
  useEffect(() => {
    let cancelled = false

    const shakeSequence = async () => {
      if (cancelled) return

      const shakeIntensity = animationTokens.shake.bubble.intensity
      const shakeDuration = animationTokens.shake.bubble.duration
      const shakeCount = animationTokens.shake.bubble.count

      for (let i = 0; i < shakeCount; i++) {
        if (cancelled) break

        const xOffset = (Math.random() - 0.5) * shakeIntensity
        const yOffset =
          (Math.random() - 0.5) * shakeIntensity + animationTokens.shake.bubble.yOffset
        const rotOffset = (Math.random() - 0.5) * animationTokens.shake.bubble.rotationRange

        await Promise.all([
          animate(shakeX, xOffset, {
            duration: shakeDuration,
            ease: "easeInOut",
          }).finished,
          animate(shakeY, yOffset, {
            duration: shakeDuration,
            ease: "easeInOut",
          }).finished,
          animate(rotation, rotOffset, {
            duration: shakeDuration,
            ease: "easeInOut",
          }).finished,
        ])

        if (cancelled) break
      }

      if (!cancelled) {
        await Promise.all([
          animate(shakeX, 0, {
            duration: animationTokens.shake.bubble.returnDuration,
            ease: "easeOut",
          }).finished,
          animate(shakeY, animationTokens.shake.bubble.yOffset, {
            duration: animationTokens.shake.bubble.returnDuration,
            ease: "easeOut",
          }).finished,
          animate(rotation, 0, {
            duration: animationTokens.shake.bubble.returnDuration,
            ease: "easeOut",
          }).finished,
        ])
      }
    }

    const timer = setTimeout(shakeSequence, animationTokens.shake.bubble.delay)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [shakeX, shakeY, rotation])

  const background = "rgba(0,0,0,0.95)" // black background
  const arrowColor = "rgba(0,0,0,0.95)"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20, filter: "blur(5px)" }}
      animate={{ opacity: 1, scale: 1, y: -5, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.8, y: 20, filter: "blur(5px)" }}
      transition={animationTokens.springs.failureBubble}
      style={{
        position: "absolute",
        bottom: "100%",
        left: "50%",
        marginBottom: "8px",
        x: useTransform([shakeX], ([x]) => `calc(-50% + ${x}px)`),
        y: shakeY,
        zIndex: 10,
        rotate: rotation,
      }}
    >
      <div
        className="text-sm p-1 px-2 font-bold"
        style={{
          background,
          color: "#dc2626", // red text
          borderRadius: animationTokens.dimensions.failureBubble.borderRadius,
          whiteSpace: "nowrap",
          maxWidth: animationTokens.dimensions.failureBubble.maxWidth,
          boxShadow: animationTokens.colors.failureBubble.shadow,
          border: "1px solid rgba(220,38,38,0.9)",
        }}
      >
        {glitchChars}
      </div>
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: `${animationTokens.dimensions.failureBubble.arrowSize} solid transparent`,
          borderRight: `${animationTokens.dimensions.failureBubble.arrowSize} solid transparent`,
          borderTop: `${animationTokens.dimensions.failureBubble.arrowSize} solid ${arrowColor}`,
        }}
      />
    </motion.div>
  )
}
