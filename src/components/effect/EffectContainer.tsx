import { motion, useTransform } from "motion/react"
import { animationTokens } from "../../animationTokens"
import type { VisualEffect } from "../../VisualEffect"
import { nodeVariants } from "./nodeVariants"
import { getTaskShadow } from "./taskUtils"
import type { AnimationValues } from "./useEffectAnimations"

interface EffectContainerProps {
  state: VisualEffect<unknown, unknown>["state"]
  animations: Pick<
    AnimationValues,
    | "nodeWidth"
    | "nodeHeight"
    | "borderRadius"
    | "rotation"
    | "shakeX"
    | "shakeY"
    | "blurAmount"
    | "glowIntensity"
  >
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  children: React.ReactNode
}

export function EffectContainer({
  animations,
  children,
  onMouseEnter,
  onMouseLeave,
  state,
}: EffectContainerProps) {
  const isDeath = state.type === "death"
  // Use variants for static state-based properties
  const current = state.type as keyof typeof nodeVariants

  return (
    <motion.div
      // Hybrid approach: variants handle static properties
      variants={nodeVariants}
      animate={current}
      initial={false}
      style={{
        // Keep imperative animations for complex/dynamic properties
        width: animations.nodeWidth,
        height: animations.nodeHeight,
        borderRadius: animations.borderRadius,
        position: "absolute",
        overflow: "hidden",
        // Let variants handle these: scale, opacity, backgroundColor
        rotate: animations.rotation,
        x: animations.shakeX,
        y: animations.shakeY,
        cursor: "auto",
        border: isDeath
          ? `2px solid ${animationTokens.colors.border.death}`
          : `1px solid ${animationTokens.colors.border.default}`,
        // Promote to its own GPU layer and limit reflows/paints
        contain: "layout style paint", // restrict the scope of layout and paint work
        willChange: "transform, filter",
        transform: "translateZ(0)", // ensure GPU compositing

        filter: useTransform([animations.blurAmount], ([blur = 0]: Array<number>) => {
          // Cap blur radius to 2px max for better performance
          const cappedBlur = Math.min(blur, 2)

          return isDeath
            ? `blur(${cappedBlur}px) contrast(${animationTokens.effects.death.contrast}) brightness(${animationTokens.effects.death.brightness})`
            : `blur(${cappedBlur}px)`
        }),
        // Use box-shadow for glow instead of expensive drop-shadow
        boxShadow: useTransform([animations.glowIntensity], ([glow = 0]: Array<number>) => {
          const cappedGlow = Math.min(glow, 8)
          const baseGlow = getTaskShadow(state)

          if (isDeath) {
            return cappedGlow > 0
              ? `${baseGlow}, 0 0 ${cappedGlow * 2}px ${animationTokens.colors.glow.death}`
              : baseGlow
          }

          return cappedGlow > 0
            ? `${baseGlow}, 0 0 ${cappedGlow}px ${animationTokens.colors.glow.running}`
            : baseGlow
        }),
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  )
}
