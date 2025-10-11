"use client"

import { Effect } from "effect"
import { useMemo, useRef } from "react"
import { EffectExample } from "@/components/display"
import type { ExampleComponentProps } from "@/lib/example-types"
import { VisualEffect, visualEffect } from "@/VisualEffect"
import { getDelay } from "./helpers"

export function EffectAllShortCircuitExample({
  exampleId,
  index,
  metadata,
}: ExampleComponentProps) {
  // Cycle counter to determine which effect should fail
  const cycleRef = useRef(0)

  // Three bank operations with different delays and cycling failure pattern
  const balance = useMemo(
    () =>
      visualEffect(
        "balance",
        Effect.gen(function* () {
          yield* Effect.sleep(getDelay(400, 800))

          // Fail on cycle 3 (first effect fails)
          if (cycleRef.current % 4 === 3) {
            return yield* Effect.fail("Account Locked!")
          }

          return "$58"
        }),
      ),
    [],
  )

  const credit = useMemo(
    () =>
      visualEffect(
        "credit",
        Effect.gen(function* () {
          yield* Effect.sleep(getDelay(400, 800))

          // Fail on cycle 0 (second effect fails)
          if (cycleRef.current % 4 === 0) {
            return yield* Effect.fail("Too Low!")
          }

          return "Approved"
        }),
      ),
    [],
  )

  const payment = useMemo(
    () =>
      visualEffect(
        "payment",
        Effect.gen(function* () {
          yield* Effect.sleep(getDelay(400, 800))

          // Fail on cycle 1 (third effect fails)
          if (cycleRef.current % 4 === 1) {
            return yield* Effect.fail("Gateway Error!")
          }

          return "Ka-ching!"
        }),
      ),
    [],
  )

  // Effect.all task that runs sequentially and stops on first failure
  const bankOperationTask = useMemo(() => {
    const allOperations = Effect.all([balance.effect, credit.effect, payment.effect]).pipe(
      Effect.map(() => "Pizza Acquired!"),
      Effect.ensuring(
        Effect.sync(() => {
          // Increment cycle counter after each attempt
          cycleRef.current = (cycleRef.current + 1) % 4
        }),
      ),
    )

    return new VisualEffect("result", allOperations)
  }, [balance, credit, payment])

  const codeSnippet = `const balance = readAccountBalance();
const credit = checkCreditScore();
const payment = chargeCreditCard();

const result = Effect.all([balance, credit, payment]);`

  const taskHighlightMap = useMemo(
    () => ({
      balance: { text: "readAccountBalance()" },
      credit: { text: "checkCreditScore()" },
      payment: { text: "chargeCreditCard()" },
      result: { text: "Effect.all([balance, credit, payment])" },
    }),
    [],
  )

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={useMemo(() => [balance, credit, payment], [balance, credit, payment])}
      resultEffect={bankOperationTask}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  )
}

export default EffectAllShortCircuitExample
