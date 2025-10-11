"use client"

import { ArrowRightIcon } from "@phosphor-icons/react"
import { motion } from "motion/react"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import type { HeaderViewRef } from "@/components"
import { CodeBlock, HeaderView } from "@/components"
import type { VisualEffect } from "../../VisualEffect"
import type { VisualRef } from "../../VisualRef"
import type { VisualScope } from "../../VisualScope"
import { EffectNode } from "../effect"
import { FloatingHighlight } from "../feedback"
import { ScopeStack } from "../scope"
import { RefDisplay, ScheduleTimeline } from "./"

export interface EffectHighlight {
  text: string
}

export interface EffectExampleProps<A, E> {
  name: string
  variant?: string
  description: React.ReactNode
  code: string
  effects: Array<VisualEffect<unknown, unknown>>
  resultEffect?: VisualEffect<A, E>
  effectHighlightMap: Record<string, EffectHighlight | undefined>
  index?: number
  showScheduleTimeline?: boolean
  isDarkMode?: boolean
  configurationPanel?: React.ReactNode
  refs?: Array<VisualRef<unknown>>
  scope?: VisualScope
  exampleId: string
}

// Default empty array to avoid recreating on every render
const EMPTY_REFS_ARRAY: Array<VisualRef<unknown>> = []

function EffectExampleComponent<A, E>({
  code,
  configurationPanel,
  description,
  exampleId,
  isDarkMode = false,
  name,
  refs = EMPTY_REFS_ARRAY,
  resultEffect,
  scope,
  showScheduleTimeline,
  effectHighlightMap,
  effects,
  variant,
}: EffectExampleProps<A, E>) {
  const [hoveredEffect, setHoveredEffect] = useState<string | null>(null)
  const [delayedHoveredEffect, setDelayedHoveredEffect] = useState<string | null>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const codeContainerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HeaderViewRef | null>(null)

  // Memoize hover handlers to prevent re-creation on every render
  const handleMouseEnter = useCallback((effectName: string) => {
    setHoveredEffect(effectName)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredEffect(null)
  }, [])

  // Handle hover with delay
  useEffect(() => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    if (hoveredEffect) {
      // Immediately show highlight when hovering
      setDelayedHoveredEffect(hoveredEffect)
    } else {
      // Delay hiding the highlight
      hoverTimeoutRef.current = setTimeout(() => {
        setDelayedHoveredEffect(null)
      }, 500) // 500ms delay before hiding
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [hoveredEffect])

  // Determine if this is a single effect example
  const isSingleEffect = !resultEffect || (effects.length === 1 && effects[0] === resultEffect)
  const headerEffect = resultEffect || effects[0]

  if (!headerEffect) {
    throw new Error("EffectExample requires at least one effect")
  }

  // Shared UI values
  const borderColorValue = isDarkMode ? "rgba(127, 29, 29, 0.5)" : "rgba(64, 64, 64, 0.5)"
  const backgroundGradient = isDarkMode
    ? "linear-gradient(to bottom right, black, rgba(127, 29, 29, 0.2))"
    : "linear-gradient(to bottom right, rgba(23, 23, 23, 0.8), rgba(23, 23, 23, 0.4))"
  const headerBackground = isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(38, 38, 38, 0.5)"
  const standardTransition = { duration: 0.2, ease: "easeInOut" as const }

  const highlightTarget = delayedHoveredEffect
    ? effectHighlightMap[delayedHoveredEffect] || null
    : null

  // If the result node should display elapsed ms from a timer-enabled effect, prefer its own timer,
  // otherwise fall back to the first input effect that has a timer.
  const labelEffectForResult: VisualEffect<unknown, unknown> | undefined = resultEffect?.showTimer
    ? (resultEffect as unknown as VisualEffect<unknown, unknown>)
    : effects.find(e => e.showTimer)

  return (
    <motion.div
      className={`w-full flex flex-col border rounded-2xl shadow-2xl relative `}
      initial={{
        boxShadow: isDarkMode ? `0 0 40px rgba(220, 38, 38, 0.3)` : `0 0 0 0 rgba(59, 130, 250, 0)`,
        borderColor: borderColorValue,
        background: backgroundGradient,
      }}
      animate={{
        boxShadow: isDarkMode ? `0 0 40px rgba(220, 38, 38, 0.3)` : `0 0 0 0 rgba(59, 130, 250, 0)`,
        borderColor: borderColorValue,
        background: backgroundGradient,
      }}
      transition={{
        borderColor: standardTransition,
        background: standardTransition,
      }}
    >
      {/* Header with interactive controls */}
      <motion.div
        className={`p-4 border-b rounded-t-2xl`}
        initial={{
          borderColor: borderColorValue,
          backgroundColor: headerBackground,
        }}
        animate={{
          borderColor: borderColorValue,
          backgroundColor: headerBackground,
        }}
        transition={standardTransition}
      >
        <HeaderView
          ref={headerRef}
          effect={headerEffect}
          name={name}
          {...(variant && { variant })}
          description={description}
          refs={refs}
          exampleId={exampleId}
        />
      </motion.div>

      {/* Configuration Panel */}
      {configurationPanel && (
        <motion.div
          initial={{
            borderColor: borderColorValue,
          }}
          animate={{
            borderColor: borderColorValue,
          }}
          transition={standardTransition}
          className="border-b"
        >
          {configurationPanel}
        </motion.div>
      )}

      {/* Refs display */}
      {refs.length > 0 && (
        <motion.div
          className="p-4 border-b"
          initial={{
            borderColor: borderColorValue,
          }}
          animate={{
            borderColor: borderColorValue,
          }}
          transition={standardTransition}
        >
          <div className="flex flex-wrap gap-3">
            {refs.map(ref => (
              <RefDisplay key={ref.name} visualRef={ref} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Main visualization */}
      <motion.div
        className={`px-4 py-5 border-b`}
        initial={{
          borderColor: borderColorValue,
        }}
        animate={{
          borderColor: borderColorValue,
        }}
        transition={standardTransition}
      >
        {isSingleEffect ? (
          // Single effect - just show the effect
          <div className="flex justify-start">
            <div
              onMouseEnter={() => handleMouseEnter(headerEffect.name)}
              onMouseLeave={handleMouseLeave}
            >
              <EffectNode effect={headerEffect} />
            </div>
          </div>
        ) : (
          // Multiple effects with arrow and result
          <div className="flex flex-row items-center justify-start gap-6">
            {/* Input effects - wrap on mobile */}
            <div className="flex flex-wrap justify-center gap-6">
              {effects.map(effect => (
                <div
                  key={effect.name}
                  onMouseEnter={() => handleMouseEnter(effect.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <EffectNode effect={effect} />
                </div>
              ))}
            </div>

            {/* Arrow - rotate on mobile */}
            <div className="text-neutral-500 rotate-0 flex items-center relative top-[-13px]">
              <ArrowRightIcon size={24} weight="fill" />
            </div>

            {/* Result */}
            {resultEffect && (
              <div
                onMouseEnter={() => handleMouseEnter(resultEffect.name)}
                onMouseLeave={handleMouseLeave}
              >
                <EffectNode
                  effect={resultEffect}
                  {...(labelEffectForResult && { labelEffect: labelEffectForResult })}
                />
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Schedule timeline (if provided) */}
      {showScheduleTimeline && effects[0] && resultEffect && (
        <motion.div
          initial={{
            borderColor: borderColorValue,
          }}
          animate={{
            borderColor: borderColorValue,
          }}
          transition={standardTransition}
          className="border-b"
        >
          <ScheduleTimeline baseEffect={effects[0]} repeatEffect={resultEffect} />
        </motion.div>
      )}

      {/* Scope visualization (if provided) */}
      {scope && (
        <motion.div
          initial={{
            borderColor: borderColorValue,
          }}
          animate={{
            borderColor: borderColorValue,
          }}
          transition={standardTransition}
          className="border-b"
        >
          <ScopeStack scope={scope} />
        </motion.div>
      )}

      {/* Code block */}
      <div
        className="relative p-4 text-base"
        ref={codeContainerRef}
        style={{ position: "relative" }}
      >
        <CodeBlock code={code} activeLines={[]} />
        <FloatingHighlight
          containerRef={codeContainerRef as React.RefObject<HTMLDivElement>}
          target={highlightTarget}
        />
      </div>
    </motion.div>
  )
}

// Helper function to compare arrays by reference and length
function areArraysEqual<T>(a: T[] | undefined, b: T[] | undefined): boolean {
  if (a === b) return true
  if (!a || !b) return a === b
  if (a.length !== b.length) return false
  return a.every((item, index) => item === b[index])
}

// Memoized component with custom comparison function
export const EffectExample = memo(EffectExampleComponent, (prevProps, nextProps) => {
  // Compare all props except functions and objects that might have new references
  return (
    prevProps.name === nextProps.name &&
    prevProps.variant === nextProps.variant &&
    prevProps.code === nextProps.code &&
    prevProps.index === nextProps.index &&
    prevProps.showScheduleTimeline === nextProps.showScheduleTimeline &&
    prevProps.isDarkMode === nextProps.isDarkMode &&
    areArraysEqual(prevProps.effects, nextProps.effects) &&
    prevProps.resultEffect === nextProps.resultEffect &&
    areArraysEqual(prevProps.refs, nextProps.refs) &&
    prevProps.scope === nextProps.scope &&
    prevProps.exampleId === nextProps.exampleId &&
    prevProps.effectHighlightMap === nextProps.effectHighlightMap
  )
}) as typeof EffectExampleComponent
