"use client"

import { Effect, Schedule } from "effect"
import { useMemo } from "react"
import { EffectExample } from "@/components/display"
import { StringResult } from "@/components/renderers"
import type { ExampleComponentProps } from "@/lib/example-types"
import { visualEffect } from "@/VisualEffect"
import { createCounter } from "./helpers"

const notificationCount = createCounter(0)

const notifications = [
  "📞 Unknown Caller",
  "📧 Cellphone Bill",
  "🔔 0 New Messages!",
  "💬 We have to talk...",
  "📅 Dinner Cancelled",
  "📰 War!",
  "😴 Nothing...",
  "😴 Still nothing",
  "🕳️ Doomscrolling",
  "🪫 Battery Low",
  "💔 Swiped Left",
  "🏠 Rent Overdue",
  "💸 Account Overdrawn",
  "🚕 Driver Cancelled",
  "🚫 Friend Request Denied",
  "📅 Meeting Moved to 4am",
  "🌧️ Rain All Week",
  "📉 Stocks Down 20%",
  "🥀 Plant Died",
]

/**
 * Simulates checking phone notifications - the classic compulsive behavior
 * Returns random notification types with realistic timing
 */
function checkNotifications(): Effect.Effect<StringResult, string, never> {
  return Effect.gen(function* () {
    if (notificationCount.current >= notifications.length) {
      yield* Effect.fail("☠️ Phone Died!")
    }

    const notification = notifications[notificationCount.current]
    notificationCount.increment()
    yield* Effect.sleep(500)

    return new StringResult(notification!)
  })
}

export function EffectRepeatSpacedExample({ exampleId, index, metadata }: ExampleComponentProps) {
  const baseTask = useMemo(() => visualEffect("phone", checkNotifications()), [])

  const repeatedTask = useMemo(
    () =>
      visualEffect(
        "checking",
        baseTask.effect.pipe(
          Effect.repeat(Schedule.spaced("2 seconds")),
          Effect.ensuring(notificationCount.reset),
        ),
      ),
    [baseTask],
  )

  const codeSnippet = `const phone = checkNotifications();
const checking = Effect.repeat(phone, Schedule.spaced("2 seconds"));`

  const taskHighlightMap = useMemo(
    () => ({
      phone: { text: "checkNotifications()" },
      checking: { text: 'Effect.repeat(phone, Schedule.spaced("2 seconds"))' },
    }),
    [],
  )

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={useMemo(() => [baseTask], [baseTask])}
      resultEffect={repeatedTask}
      effectHighlightMap={taskHighlightMap}
      showScheduleTimeline={true}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectRepeatSpacedExample
