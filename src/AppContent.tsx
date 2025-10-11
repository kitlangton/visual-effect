"use client"

import {
  ArrowClockwiseIcon,
  HashStraightIcon,
  HeartIcon,
  PlayIcon,
  SkullIcon,
  StopIcon,
} from "@phosphor-icons/react"
import { MotionConfig } from "motion/react"
import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"

// Examples
import EffectAcquireRelease from "@/examples/effect-acquire-release"
import EffectAddFinalizer from "@/examples/effect-add-finalizer"
import EffectAll from "@/examples/effect-all"
import EffectAllShortCircuit from "@/examples/effect-all-short-circuit"
import EffectDie from "@/examples/effect-die"
import EffectEventually from "@/examples/effect-eventually"
import EffectFail from "@/examples/effect-fail"
import EffectForEach from "@/examples/effect-foreach"
import EffectOrElse from "@/examples/effect-orelse"
import EffectPartition from "@/examples/effect-partition"
import EffectPromise from "@/examples/effect-promise"
import EffectRace from "@/examples/effect-race"
import EffectRaceAll from "@/examples/effect-raceall"
import EffectRepeatSpaced from "@/examples/effect-repeat-spaced"
import EffectRepeatWhileOutput from "@/examples/effect-repeat-while-output"
import EffectRetryExponential from "@/examples/effect-retry-exponential"
import EffectRetryRecurs from "@/examples/effect-retry-recurs"
import EffectSleep from "@/examples/effect-sleep"
import EffectSucceed from "@/examples/effect-succeed"
import EffectSync from "@/examples/effect-sync"
import EffectTimeout from "@/examples/effect-timeout"
import EffectValidate from "@/examples/effect-validate"

import RefMake from "@/examples/ref-make"
import RefUpdateAndGet from "@/examples/ref-update-and-get"
import type { ExampleMeta } from "@/lib/example-types"

type ExampleComponent = React.ComponentType<{
  index: number
  metadata: ExampleMeta
  exampleId: string
}>

const exampleComponentById: Record<string, ExampleComponent> = {
  "effect-acquire-release": EffectAcquireRelease,
  "effect-add-finalizer": EffectAddFinalizer,
  "effect-all-short-circuit": EffectAllShortCircuit,
  "effect-all": EffectAll,
  "effect-die": EffectDie,
  "effect-eventually": EffectEventually,
  "effect-fail": EffectFail,
  "effect-foreach": EffectForEach,
  "effect-orelse": EffectOrElse,
  "effect-partition": EffectPartition,
  "effect-promise": EffectPromise,
  "effect-race": EffectRace,
  "effect-raceall": EffectRaceAll,
  "effect-repeat-spaced": EffectRepeatSpaced,
  "effect-repeat-while-output": EffectRepeatWhileOutput,
  "effect-retry-exponential": EffectRetryExponential,
  "effect-retry-recurs": EffectRetryRecurs,
  "effect-sleep": EffectSleep,
  "effect-succeed": EffectSucceed,
  "effect-sync": EffectSync,
  "effect-timeout": EffectTimeout,
  "effect-validate": EffectValidate,
  "ref-make": RefMake,
  "ref-update-and-get": RefUpdateAndGet,
}

import { EffectLogo } from "@/components/feedback"
import { NavigationSidebar, PageHeader } from "@/components/layout"
import { QuickOpen } from "@/components/ui"
import type { AppItem, ExampleItem } from "@/lib/example-types"
import { defaultSpring } from "@/motionConfig"
import { appItems, createExampleId } from "@/shared/appItems"
import { taskSounds } from "@/sounds/TaskSounds"
import { InfoCallout } from "./components/InfoCallout"

// Helper function to get item section
function getItemSection(item: AppItem): string {
  return item.type === "example" ? item.metadata.section : item.section
}

function AppContentInner() {
  const [isMuted, setIsMuted] = useState(false)

  // Update sound system when mute changes
  useEffect(() => {
    taskSounds.setMuted(isMuted)
  }, [isMuted])

  const [currentExampleId, setCurrentExampleId] = useState<string | undefined>()

  // Handle example selection from sidebar
  const handleExampleSelect = useCallback((id: string) => {
    setCurrentExampleId(id)
    // Scroll to the element
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [])

  // Prepare data for the Command-K quick-open modal
  const quickOpenItems = useMemo(
    () =>
      appItems
        .filter((item): item is ExampleItem => item.type === "example")
        .map(item => ({
          id: createExampleId(item.metadata.name, item.metadata.variant),
          name: item.metadata.name,
          ...(item.metadata.variant ? { variant: item.metadata.variant } : {}),
          section: item.metadata.section,
        })),
    [],
  )

  const navigationExamples = useMemo(
    () =>
      appItems
        .filter((item): item is ExampleItem => item.type === "example")
        .map(item => ({
          id: createExampleId(item.metadata.name, item.metadata.variant),
          name: item.metadata.name,
          ...(item.metadata.variant ? { variant: item.metadata.variant } : {}),
          section: item.metadata.section,
        })),
    [],
  )

  const exampleIdSet = useMemo(() => new Set(navigationExamples.map(example => example.id)), [
    navigationExamples,
  ])

  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    const segments = pathname.split("/").filter(Boolean)

    if (segments.length === 0) {
      setCurrentExampleId(undefined)
      return
    }

    const targetId = decodeURIComponent(segments[segments.length - 1]!)
    if (!exampleIdSet.has(targetId)) return

    window.requestAnimationFrame(() => {
      // RequestAnimationFrame ensures the DOM is ready before attempting to scroll.
      handleExampleSelect(targetId)
    })
  }, [pathname, exampleIdSet, handleExampleSelect])

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-mono relative overflow-hidden">
      {/* Command-K quick-open modal */}
      <QuickOpen items={quickOpenItems} onSelect={handleExampleSelect} />

      <div className="max-w-screen-l mx-auto relative">
        {/* Navigation Sidebar */}
        <NavigationSidebar
          examples={navigationExamples}
          currentExample={currentExampleId || undefined}
          onExampleSelect={handleExampleSelect}
        />

        <div className="xl:ml-64 p-4 sm:p-8">
          <div className="w-full flex flex-col items-center max-w-screen-md mx-auto relative z-10">
            <PageHeader isMuted={isMuted} onMuteToggle={() => setIsMuted(!isMuted)} />

            {/* Introduction section */}
            <div className="w-full max-w-screen-md mt-24 mb-12 p-8 border border-neutral-700/50 rounded-2xl shadow-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 backdrop-blur-sm font-mono text-neutral-300 text-lg relative overflow-hidden">
              <div className="relative z-10">
                <p className="leading-relaxed text-left text-xl font-light">
                  Here are some interactive examples of TypeScript's beautiful{" "}
                  <EffectLogo className="inline-block  h-4 relative top-[-1px] pr-3 opacity-90" />
                  <a
                    href="https://effect.website"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-extrabold cursor-pointer hover:text-white transition-all duration-300 tracking-wider  inline-block"
                  >
                    Effect
                  </a>{" "}
                  library. Tap the following effects to{" "}
                  <PlayIcon size={16} className="inline mr-2" weight="bold" />
                  <span className="font-bold ">run</span>,{" "}
                  <StopIcon size={16} className="inline mr-2" weight="bold" />
                  <span className="font-bold ">interrupt</span>, or{" "}
                  <ArrowClockwiseIcon size={16} className="inline mr-2" weight="bold" />
                  <span className="font-bold ">reset</span> them.
                </p>
              </div>
            </div>

            {/* Multiple effect examples and callouts */}
            <div className="w-full max-w-screen-md flex flex-col items-center gap-y-8 sm:gap-y-12">
              {appItems.map((item, index) => {
                const prevItem: AppItem | undefined = index > 0 ? appItems[index - 1] : undefined
                const showSectionHeader =
                  index === 0 ||
                  (prevItem !== undefined && getItemSection(prevItem) !== getItemSection(item))

                return (
                  <Fragment key={index}>
                    {showSectionHeader && (
                      <div className="w-full mt-16 mb-0">
                        <h2 className="text-lg sm:text-2xl font-mono text-neutral-300 tracking-wider font-bold relative">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50  ">
                              <HashStraightIcon
                                weight="bold"
                                size={20}
                                className="text-neutral-400"
                              />
                            </div>
                            <span className="text-neutral-400">
                              {getItemSection(item).toUpperCase()}
                            </span>
                          </div>
                        </h2>
                      </div>
                    )}
                    <div className="w-full relative">
                      {item.type === "example" ? (
                        <div id={createExampleId(item.metadata.name, item.metadata.variant)}>
                          {(() => {
                            const Component = exampleComponentById[item.metadata.id]
                            if (!Component) return null
                            return (
                              <Component
                                metadata={item.metadata}
                                index={index}
                                exampleId={createExampleId(
                                  item.metadata.name,
                                  item.metadata.variant,
                                )}
                              />
                            )
                          })()}
                        </div>
                      ) : (
                        <InfoCallout>{item.content}</InfoCallout>
                      )}
                    </div>
                  </Fragment>
                )
              })}
            </div>

            {/* Footer */}
            <footer className="w-full max-w-screen-md mt-40 mb-12 flex items-center justify-between text-xs sm:text-base">
              {/* Left side */}
              <div className="text-neutral-400 font-bold tracking-wide flex items-center gap-1.5 sm:gap-2">
                EFFECT OR
                <SkullIcon size={16} weight="fill" className="text-neutral-400 sm:hidden" />
                <SkullIcon
                  size={19}
                  weight="fill"
                  className="text-neutral-400 hidden sm:block ml-[3px]"
                />
              </div>

              {/* Right side */}
              <a
                href="https://twitter.com/kitlangton"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-neutral-200 transition-all duration-300 font-bold tracking-wide group flex items-center gap-1.5 sm:gap-2"
              >
                <HeartIcon
                  size={14}
                  weight="fill"
                  className="text-red-500 group-hover:text-red-400 transition-transform duration-300 group-hover:scale-110 sm:hidden"
                />
                <HeartIcon
                  size={18}
                  weight="fill"
                  className="text-red-500 group-hover:text-red-400 transition-transform duration-300 group-hover:scale-110 hidden sm:block"
                />
                KIT
              </a>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AppContent() {
  return (
    <MotionConfig transition={defaultSpring}>
      <AppContentInner />
    </MotionConfig>
  )
}
