"use client"

import { Cause, Effect } from "effect"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { EffectExample } from "@/components/display"
import { EmojiResult } from "@/components/renderers"
import type { ExampleComponentProps } from "@/lib/example-types"
import { visualEffect } from "@/VisualEffect"
import { getDelay } from "./helpers"

// Password generator
function generatePassword(): string {
  const passwords = [
    "password123",
    "12345678",
    "SuperSecret2024!",
    "p@ssw0rd",
    "admin",
    "correcthorsebatterystaple",
    "ThisIsWayTooLongForAnyReasonablePasswordManagerToHandle2024!",
    "abc",
    "P@ssw0rd123!",
    "hunter2",
    "qwerty",
    "letmein",
    "iloveyou",
    "monkey123",
    "dragon",
  ]
  return passwords[Math.floor(Math.random() * passwords.length)]!
}

export function EffectValidateExample({ exampleId, index, metadata }: ExampleComponentProps) {
  // Use state to track current password and trigger re-renders
  const password = useRef(generatePassword())
  const [, setState] = useState(0)

  // Individual validation tasks with random errors
  const length = useMemo(
    () =>
      visualEffect(
        "length",
        Effect.gen(function* () {
          yield* Effect.sleep(getDelay(600, 900))

          const len = password.current.length

          // Real length validation - tuned to fail ~50% of passwords
          if (len < 8) {
            return yield* Effect.fail("Too Short!")
          }
          if (len > 20) {
            return yield* Effect.fail("Too Long!")
          }
          // Add some randomness to make borderline cases sometimes fail
          if (len === 8 && Math.random() < 0.3) {
            return yield* Effect.fail("Too Weak!")
          }

          return new EmojiResult("👌")
        }),
      ),
    [],
  )

  const complexity = useMemo(
    () =>
      visualEffect(
        "complexity",
        Effect.gen(function* () {
          yield* Effect.sleep(getDelay(400, 600))

          const hasLower = /[a-z]/.test(password.current)
          const hasUpper = /[A-Z]/.test(password.current)
          const hasNumbers = /[0-9]/.test(password.current)
          const hasSpecial = /[^a-zA-Z0-9]/.test(password.current)

          const complexity = [hasLower, hasUpper, hasNumbers, hasSpecial].filter(Boolean).length

          // Real complexity validation - tuned to fail ~50% of passwords
          if (complexity < 2) {
            return yield* Effect.fail("Too Simple!")
          }

          // Check for obviously weak patterns
          if (password.current.toLowerCase() === password.current && !hasNumbers && !hasSpecial) {
            return yield* Effect.fail("Weak!")
          }

          if (/^\d+$/.test(password.current)) {
            return yield* Effect.fail("Only #s!")
          }

          // Sometimes fail even decent passwords to hit ~50% rate
          if (complexity === 2 && Math.random() < 0.3) {
            return yield* Effect.fail("Meh!")
          }

          return new EmojiResult("👌")
        }),
      ),
    [],
  )

  const vibes = useMemo(
    () =>
      visualEffect(
        "vibes",
        Effect.gen(function* () {
          yield* Effect.sleep(getDelay(350, 550))

          // Only fail 40% of the time
          if (Math.random() > 0.4) {
            return new EmojiResult("👌")
          }

          // Special failure message for each specific password
          const currentPassword = password.current
          const vibeFailures: Record<string, string> = {
            password123: "Basic!",
            "12345678": "Boring!",
            "SuperSecret2024!": "Try Hard!",
            "p@ssw0rd": "Cringe!",
            admin: "Sus!",
            correcthorsebatterystaple: "Too XKCD!",
            "ThisIsWayTooLongForAnyReasonablePasswordManagerToHandle2024!": "Extra!",
            abc: "Lazy!",
            "P@ssw0rd123!": "Obvious!",
            hunter2: "Meme!",
            qwerty: "NO, DVORAK!",
            letmein: "Desperate!",
            iloveyou: "Cheesy!",
            monkey123: "Random!",
            dragon: "Fantasy!",
          }

          const vibeError = vibeFailures[currentPassword]
          if (vibeError) {
            return yield* Effect.fail(vibeError)
          }

          // Fallback for any password not in the list
          return yield* Effect.fail("Off!")
        }),
      ),
    [],
  )

  // Subscribe to task state changes to generate new password and trigger re-render when reset
  useEffect(() => {
    const unsubscribe = length.subscribe(() => {
      if (length.state.type === "idle") {
        password.current = generatePassword()
        // Invalidate the view by updating the state
        setState(prev => prev + 1) // Assuming setState is a state updater function
      }
    })

    return unsubscribe
  }, [length])

  // Validation task that accumulates all errors
  const validationTask = useMemo(() => {
    const validateAll = length.effect.pipe(
      Effect.validate(complexity.effect),
      Effect.validate(vibes.effect),
      Effect.map(() => "Password Accepted!"),
      Effect.mapErrorCause(cause => {
        // Extract all failure messages from the accumulated cause
        const failures = Cause.failures(cause)
        return Cause.fail(`${failures.length} error${failures.length === 1 ? "" : "s"}`)
      }),
    )

    return visualEffect("result", validateAll)
  }, [length, complexity, vibes])

  const codeSnippet = `const length = checkLength(password);
const complexity = checkComplexity(password);
const vibes = checkVibes(password);

const result = length.pipe(
  Effect.validate(complexity),
  Effect.validate(vibes)
);`

  const taskHighlightMap = useMemo(
    () => ({
      length: { text: "checkLength(password)" },
      complexity: { text: "checkComplexity(password)" },
      vibes: { text: "checkVibes(password)" },
      result: { text: "length.pipe(Effect.validate(...))" },
    }),
    [],
  )

  return (
    <>
      <div className="text-neutral-400 text-sm mb-2 font-mono">
        Testing password:{" "}
        <AnimatePresence mode="wait">
          <motion.span
            key={password.current}
            initial={{ scale: 0.8, opacity: 0, filter: "blur(4px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.8, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="text-white"
          >
            {password.current}
          </motion.span>
        </AnimatePresence>
      </div>
      <EffectExample
        name={metadata.name}
        {...(metadata.variant && { variant: metadata.variant })}
        description={metadata.description}
        code={codeSnippet}
        effects={useMemo(() => [length, complexity, vibes], [length, complexity, vibes])}
        resultEffect={validationTask}
        effectHighlightMap={taskHighlightMap}
        {...(index !== undefined && { index })}
        exampleId={exampleId}
      />
    </>
  )
}

export default EffectValidateExample
