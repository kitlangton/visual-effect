import {
  type AnimationPlaybackControls,
  animate,
  type MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { animationTokens } from "../../animationTokens"
import { useStateTransition } from "../../hooks/useStateTransition"
import { theme } from "../../theme"
import type { VisualEffect } from "../../VisualEffect"

type TaskState = VisualEffect<unknown, unknown>["state"]

export interface AnimationValues {
  nodeWidth: MotionValue<number>
  nodeHeight: MotionValue<number>
  contentOpacity: MotionValue<number>
  flashOpacity: MotionValue<number>
  flashColor: MotionValue<string>
  borderRadius: MotionValue<number>
  rotation: MotionValue<number>
  shakeX: MotionValue<number>
  shakeY: MotionValue<number>
  contentScale: MotionValue<number>
  blurAmount: MotionValue<number>
  borderColor: MotionValue<string>
  borderOpacity: MotionValue<number>
  glowIntensity: MotionValue<number>
}

/** tiny util: stable init once without eslint disables */
function useConst<T>(init: () => T): T {
  const ref = useRef<T | null>(null)
  if (ref.current === null) ref.current = init()
  return ref.current
}

/** minimal, SSR-safe reduced-motion hook */
function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    const set = () => setPrefers(mql.matches)
    set()
    // legacy Safari support
    const onChange = (e: MediaQueryListEvent) => setPrefers(e.matches)
    mql.addEventListener ? mql.addEventListener("change", onChange) : mql.addListener(onChange)
    return () => {
      mql.removeEventListener
        ? mql.removeEventListener("change", onChange)
        : mql.removeListener(onChange)
    }
  }, [])
  return prefers
}

// ------------------------
// useTaskAnimations
// ------------------------
export function useTaskAnimations(): AnimationValues {
  const nodeWidth = useSpring(
    animationTokens.dimensions.nodeDefaults.width,
    animationTokens.springs.nodeWidth,
  )
  const contentOpacity = useSpring(1, animationTokens.springs.default)
  const flashOpacity = useMotionValue(0)
  const flashColor = useMotionValue<string>(animationTokens.colors.flash)
  const borderRadius = useSpring(theme.radius.md, animationTokens.springs.default)
  const nodeHeight = useMotionValue(64)
  const rotation = useMotionValue(0)
  const shakeX = useMotionValue(0)
  const shakeY = useMotionValue(0)
  const contentScale = useSpring(1, animationTokens.springs.default)
  const borderColor = useMotionValue<string>(animationTokens.colors.border.default)
  const borderOpacity = useSpring(1, animationTokens.springs.default)
  const glowIntensity = useSpring(0, animationTokens.springs.default)

  const rotationVelocity = useVelocity(rotation)

  // Optional smoothing of velocity -> blur to avoid flicker
  // const smoothedVel = useSpring(rotationVelocity, { stiffness: 200, damping: 40 })
  const blurAmount = useTransform(rotationVelocity, [-100, 0, 100], [1, 0, 1], { clamp: true })

  // Stable container without eslint disables
  const animations = useConst<AnimationValues>(() => ({
    nodeWidth,
    nodeHeight,
    contentOpacity,
    flashOpacity,
    flashColor,
    borderRadius,
    rotation,
    shakeX,
    shakeY,
    contentScale,
    blurAmount,
    borderColor,
    borderOpacity,
    glowIntensity,
  }))

  return animations
}

// ------------------------
// useRunningAnimation
// ------------------------
export function useRunningAnimation(
  isRunning: boolean,
  animations: Pick<
    AnimationValues,
    "rotation" | "shakeX" | "shakeY" | "borderOpacity" | "glowIntensity"
  >,
) {
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    let cancelled = false
    let rafId: number | null = null // single RAF id (fix leak)
    const animControls: {
      border: AnimationPlaybackControls | undefined
      glow: AnimationPlaybackControls | undefined
    } = { border: undefined, glow: undefined }

    const stopAll = () => {
      if (animControls.border) animControls.border.stop()
      if (animControls.glow) animControls.glow.stop()
      if (rafId !== null) cancelAnimationFrame(rafId)
      // reset quickly
      animate(animations.rotation, 0, {
        duration: animationTokens.timing.exit.duration,
        ease: animationTokens.timing.exit.ease,
      })
      animate(animations.shakeX, 0, {
        duration: animationTokens.timing.exit.duration,
        ease: animationTokens.timing.exit.ease,
      })
      animate(animations.shakeY, 0, {
        duration: animationTokens.timing.exit.duration,
        ease: animationTokens.timing.exit.ease,
      })
      animations.borderOpacity.set(1)
      animations.glowIntensity.set(0)
    }

    if (!isRunning || prefersReducedMotion) {
      stopAll()
      return
    }

    // border pulse
    animControls.border = animate(
      animations.borderOpacity,
      [...animationTokens.timing.borderPulse.values],
      {
        duration: animationTokens.timing.borderPulse.duration,
        ease: "easeInOut",
        repeat: Infinity,
      },
    )

    // glow pulse
    animControls.glow = animate(
      animations.glowIntensity,
      [...animationTokens.timing.glowPulse.values],
      {
        duration: animationTokens.timing.glowPulse.duration,
        ease: "easeInOut",
        repeat: Infinity,
      },
    )

    const jitter = () => {
      if (cancelled) return

      const angle =
        (Math.random() * animationTokens.shake.running.angleRange +
          animationTokens.shake.running.angleBase) *
        (Math.random() < 0.5 ? 1 : -1)

      const offset =
        (Math.random() * animationTokens.shake.running.offsetRange +
          animationTokens.shake.running.offsetBase) *
        (Math.random() < 0.5 ? -1 : 1)

      const offsetY =
        (Math.random() * animationTokens.shake.running.offsetYRange +
          animationTokens.shake.running.offsetYBase) *
        (Math.random() < 0.5 ? -1 : 1)

      // FIX: proper [min,max] duration
      const min = animationTokens.shake.running.durationMin
      const max = animationTokens.shake.running.durationMax ?? min * 2
      const duration = min + Math.random() * Math.max(0.001, max - min)

      const rot = animate(animations.rotation, angle, { duration, ease: "circInOut" })
      const x = animate(animations.shakeX, offset, { duration, ease: "easeInOut" })
      const y = animate(animations.shakeY, offsetY, { duration, ease: "easeInOut" })

      // When this triple finishes, schedule next cycle on next frame
      Promise.all([rot.finished, x.finished, y.finished]).then(() => {
        if (cancelled) return
        rafId = requestAnimationFrame(jitter)
      })
    }

    rafId = requestAnimationFrame(jitter)

    return () => {
      cancelled = true
      stopAll()
    }
  }, [
    isRunning,
    animations.rotation,
    animations.shakeX,
    animations.shakeY,
    animations.borderOpacity,
    animations.glowIntensity,
  ])
}

// ------------------------
// useStateAnimations
// ------------------------
export function useStateAnimations(state: TaskState, animations: AnimationValues) {
  const isRunning = state.type === "running"

  // Radius
  useEffect(() => {
    animations.borderRadius.set(isRunning ? 15 : theme.radius.md)
  }, [isRunning, animations.borderRadius])

  // Height
  useEffect(() => {
    animate(animations.nodeHeight, isRunning ? 64 * 0.4 : 64, {
      duration: 0.4,
      bounce: isRunning ? 0.3 : 0.5,
      type: "spring",
    })
  }, [isRunning, animations.nodeHeight])

  // Width & content opacity
  useEffect(() => {
    const hasResult = state.type === "completed"

    if (!hasResult) {
      animations.nodeWidth.set(64) // if you want this animated, swap to animate(...)
    }

    animations.contentOpacity.set(hasResult ? 1 : state.type === "running" ? 0 : 1)
  }, [state, animations, isRunning])
}

// ------------------------
// useEffectAnimations
// ------------------------
export function useEffectAnimations(
  state: TaskState,
  animations: AnimationValues,
  isHovering: boolean,
  setShowErrorBubble: (show: boolean) => void,
) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isFailish = state.type === "failed" || state.type === "death"

  // Error bubble visibility (comment aligned with code: 1.5s)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined

    if (isFailish) {
      setShowErrorBubble(true)
      timer = setTimeout(() => {
        if (!isHovering) setShowErrorBubble(false)
      }, 1500)
    } else {
      setShowErrorBubble(false)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isFailish, isHovering, setShowErrorBubble])

  // Flash on start/complete
  const transition = useStateTransition(state)
  useEffect(() => {
    if (transition.justCompleted || transition.justStarted) {
      const up = animate(animations.flashOpacity, 0.6, {
        duration: 0.02,
        ease: "circOut",
      })
      up.finished.then(() => {
        if (prefersReducedMotion) {
          animations.flashOpacity.set(0)
        } else {
          animate(animations.flashOpacity, 0, {
            duration: animationTokens.timing.flash.duration,
            ease: animationTokens.timing.flash.ease,
          })
        }
      })
    }
  }, [
    transition.justCompleted,
    transition.justStarted,
    animations.flashOpacity,
    prefersReducedMotion,
  ])

  // Failure/Death shake
  useEffect(() => {
    if (!(state.type === "failed" || state.type === "death") || prefersReducedMotion) return

    let cancelled = false

    const shakeSequence = async () => {
      const { intensity, duration, count, rotationRange, returnDuration } =
        animationTokens.shake.failure

      for (let i = 0; i < count && !cancelled; i++) {
        const xOffset = (Math.random() - 0.5) * intensity
        const yOffset = (Math.random() - 0.5) * intensity
        const rotOffset = (Math.random() - 0.5) * rotationRange

        const anims = [
          animate(animations.shakeX, xOffset, { duration, ease: "easeInOut" }),
          animate(animations.shakeY, yOffset, { duration, ease: "easeInOut" }),
          animate(animations.rotation, rotOffset, { duration, ease: "easeInOut" }),
        ]
        await Promise.all(anims.map(a => a.finished))
      }

      if (!cancelled) {
        await Promise.all([
          animate(animations.shakeX, 0, { duration: returnDuration, ease: "easeOut" }).finished,
          animate(animations.shakeY, 0, { duration: returnDuration, ease: "easeOut" }).finished,
          animate(animations.rotation, 0, { duration: returnDuration, ease: "easeOut" }).finished,
        ])
      }
    }

    shakeSequence()
    return () => {
      cancelled = true
    }
  }, [state, prefersReducedMotion, animations.shakeX, animations.shakeY, animations.rotation])

  // Death glitch
  useEffect(() => {
    if (state.type !== "death" || prefersReducedMotion) {
      animations.glowIntensity.set(0)
      return
    }

    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const scheduleIdle = (cb: () => void, delay: number) => {
      timeoutId = setTimeout(() => {
        // requestIdleCallback if available
        const win = window as Window & { requestIdleCallback?: (cb: () => void) => number }
        if (typeof win.requestIdleCallback === "function") {
          win.requestIdleCallback(cb)
        } else {
          cb()
        }
      }, delay)
    }

    const glitchSequence = async () => {
      const t = animationTokens.timing.glitch
      const e = animationTokens.effects.glitch

      // initial pulses
      for (let i = 0; i < t.initialCount && !cancelled; i++) {
        animations.contentScale.set(1 + Math.random() * e.scaleRange)
        animations.glowIntensity.set(Math.random() * e.intensePulseMax)

        await new Promise<void>(resolve => {
          scheduleIdle(
            resolve,
            t.initialDelayMin + Math.random() * Math.max(0, t.initialDelayMax - t.initialDelayMin),
          )
        })

        if (cancelled) break
        animations.contentScale.set(1)
        animations.glowIntensity.set(e.glowMax)

        await new Promise<void>(resolve => {
          scheduleIdle(resolve, t.pauseMin + Math.random() * Math.max(0, t.pauseMax - t.pauseMin))
        })
      }

      // subtle loop (only one timeout pending at any time)
      const subtle = () => {
        if (cancelled) return
        animations.glowIntensity.set(e.glowMin + Math.random() * (e.glowMax - e.glowMin))
        scheduleIdle(
          subtle,
          t.subtleDelayMin + Math.random() * Math.max(0, t.subtleDelayMax - t.subtleDelayMin),
        )
      }
      subtle()
    }

    glitchSequence()

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
      animations.glowIntensity.set(0)
    }
  }, [state, prefersReducedMotion, animations.contentScale, animations.glowIntensity])

  // Content scale pop on completion
  useLayoutEffect(() => {
    if (transition.justCompleted) {
      animations.contentScale.set(0)
      animate(animations.contentScale, [1.3, 1], animationTokens.springs.contentScale)
    } // <- removed stray 's'
  }, [transition.justCompleted, animations.contentScale])
}
