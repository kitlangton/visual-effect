import type { ExampleMeta } from "./example-types"

// This is the single source of truth for all examples
// Examples are listed in the exact order they should appear
export const examplesManifest: Array<ExampleMeta> = [
  // Constructors
  {
    id: "effect-succeed",
    name: "Effect.succeed",
    description: "Create an effect that always succeeds with a given value",
    section: "constructors",
  },
  {
    id: "effect-fail",
    name: "Effect.fail",
    description: "Create an effect that represents a recoverable error",
    section: "constructors",
  },
  {
    id: "effect-die",
    name: "Effect.die",
    description: "Create an effect that terminates with an unrecoverable defect",
    section: "constructors",
  },
  {
    id: "effect-sync",
    name: "Effect.sync",
    description: "Create an effect from a synchronous side-effectful computation",
    section: "constructors",
  },
  {
    id: "effect-promise",
    name: "Effect.promise",
    description: "Create an effect from an asynchronous computation guaranteed to succeed",
    section: "constructors",
  },
  {
    id: "effect-sleep",
    name: "Effect.sleep",
    description: "Create an effect that suspends execution for a given duration",
    section: "constructors",
  },

  // Concurrency
  {
    id: "effect-all",
    name: "Effect.all",
    description: "Combine multiple effects into one, returning results based on input structure",
    section: "concurrency",
  },
  {
    id: "effect-race",
    name: "Effect.race",
    description: "Race two effects and return the result of the first successful one",
    section: "concurrency",
  },
  {
    id: "effect-raceall",
    name: "Effect.raceAll",
    description: "Race multiple effects and return the first successful result",
    section: "concurrency",
  },
  {
    id: "effect-foreach",
    name: "Effect.forEach",
    description: "Execute an effectful operation for each element in an iterable",
    section: "concurrency",
  },
  // {
  //   id: "effect-semaphore",
  //   name: "Effect.Semaphore",
  //   description: "Limit concurrent access to shared resources",
  //   section: "concurrency",
  // },
  // {
  //   id: "effect-ratelimiter",
  //   name: "Effect.RateLimiter",
  //   description: "Throttle operations to prevent overload",
  //   section: "concurrency",
  // },

  // Error Handling
  {
    id: "effect-all-short-circuit",
    name: "Effect.all",
    variant: "short circuit",
    description: "Stop execution on the first error encountered",
    section: "error handling",
  },
  {
    id: "effect-orelse",
    name: "Effect.orElse",
    description: "Try one effect, and if it fails, fall back to another effect",
    section: "error handling",
  },
  {
    id: "effect-timeout",
    name: "Effect.timeout",
    description: "Add a time limit to an effect, failing with timeout if exceeded",
    section: "error handling",
  },
  {
    id: "effect-eventually",
    name: "Effect.eventually",
    description: "Run an effect repeatedly until it succeeds, ignoring errors",
    section: "error handling",
  },
  {
    id: "effect-partition",
    name: "Effect.partition",
    description: "Execute effects and partition results into successes and failures",
    section: "error handling",
  },
  {
    id: "effect-validate",
    name: "Effect.validate",
    description: "Accumulate validation errors instead of short-circuiting",
    section: "error handling",
  },

  // Schedule
  {
    id: "effect-repeat-spaced",
    name: "Effect.repeat",
    description: "Repeat an effect with a fixed delay between each execution",
    section: "schedule",
    variant: "spaced",
  },
  {
    id: "effect-repeat-while-output",
    name: "Effect.repeat",
    variant: "whileOutput",
    description: "Repeat while output matches a condition",
    section: "schedule",
  },
  {
    id: "effect-retry-recurs",
    name: "Effect.retry",
    description: "Retry an effect a fixed number of times",
    section: "schedule",
    variant: "recurs",
  },
  {
    id: "effect-retry-exponential",
    name: "Effect.retry",
    variant: "exponential",
    description: "Retry with exponential backoff",
    section: "schedule",
  },

  // Ref
  {
    id: "ref-make",
    name: "Ref.make",
    description: "Create a concurrency-safe mutable reference",
    section: "ref",
  },
  {
    id: "ref-update-and-get",
    name: "Ref.updateAndGet",
    description: "Update a ref and return the new value",
    section: "ref",
  },

  // Scope
  {
    id: "effect-add-finalizer",
    name: "Effect.addFinalizer",
    description: "Register cleanup actions in a scope",
    section: "scope",
  },
  {
    id: "effect-acquire-release",
    name: "Effect.acquireRelease",
    description: "Acquire resources with guaranteed cleanup",
    section: "scope",
  },
]

// Section callout content
export const sectionCallouts: Partial<Record<ExampleMeta["section"], string>> = {}
//   {
//     "error handling": `**Error Handling** in Effect is **type-safe** and **composable**. Effects track potential errors at the type level, enabling precise error recovery and handling strategies.

// Effect provides powerful tools like **catchAll**, **catchTag**, **retry**, and **either** to handle different failure scenarios. Errors are tracked as union types, ensuring you know exactly what can go wrong and handle it appropriately.`,

//     schedule: `**Scheduling** enables **repeating** and **retrying** effects with sophisticated timing control. Schedules are composable patterns that define when and how often effects should execute.

// Use schedules to implement **retry policies** for resilient error handling, **repetition patterns** for recurring tasks, and **complex timing behaviors** by combining simple schedules into sophisticated recurrence patterns.`,

//     ref: `**Refs** are Effect's solution for **state management** in concurrent applications. They enable safe communication and shared state between different fibers in your program.

// Unlike regular variables, refs provide **controlled state updates** that work safely across concurrent operations, ensuring consistency even when multiple fibers access the same state simultaneously.`,

//     scope: `**Scopes** represent the **lifetime of resources** and ensure efficient cleanup and safe resource handling. They manage a stack of **finalizers** that define how to release resources.

// The key guarantee is that finalizers are executed **no matter what** — whether the effect succeeds, fails, dies, or is interrupted.`,
//   };

// Helper function to get metadata by ID
export function getExampleMeta(id: string): ExampleMeta | undefined {
  return examplesManifest.find(meta => meta.id === id)
}

// Helper function to load example component dynamically
export async function loadExampleComponent(id: string) {
  const mod = await import(`../examples/${id}`)
  return mod.default
}
