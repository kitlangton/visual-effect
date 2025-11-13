import type { ExampleMeta } from './example-types';

// This is the single source of truth for all examples
// Examples are listed in the exact order they should appear
export const examplesManifest: Array<ExampleMeta> = [
  // Constructors
  {
    id: 'effect-succeed',
    name: 'Effect.succeed',
    description: 'Create an effect that always succeeds with a given value',
    section: 'constructors',
  },
  {
    id: 'effect-fail',
    name: 'Effect.fail',
    description: 'Create an effect that represents a recoverable error',
    section: 'constructors',
  },
  {
    id: 'effect-die',
    name: 'Effect.die',
    description: 'Create an effect that terminates with an unrecoverable defect',
    section: 'constructors',
  },
  {
    id: 'effect-sync',
    name: 'Effect.sync',
    description: 'Create an effect from a synchronous side-effectful computation',
    section: 'constructors',
  },
  {
    id: 'effect-promise',
    name: 'Effect.promise',
    description: 'Create an effect from an asynchronous computation guaranteed to succeed',
    section: 'constructors',
  },
  {
    id: 'effect-sleep',
    name: 'Effect.sleep',
    description: 'Create an effect that suspends execution for a given duration',
    section: 'constructors',
  },

  // Concurrency
  {
    id: 'effect-all',
    name: 'Effect.all',
    description: 'Combine multiple effects into one, returning results based on input structure',
    section: 'concurrency',
  },
  {
    id: 'effect-race',
    name: 'Effect.race',
    description: 'Race two effects and return the result of the first successful one',
    section: 'concurrency',
  },
  {
    id: 'effect-raceall',
    name: 'Effect.raceAll',
    description: 'Race multiple effects and return the first successful result',
    section: 'concurrency',
  },
  {
    id: 'effect-foreach',
    name: 'Effect.forEach',
    description: 'Execute an effectful operation for each element in an iterable',
    section: 'concurrency',
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
    id: 'effect-all-short-circuit',
    name: 'Effect.all',
    variant: 'short circuit',
    description: 'Stop execution on the first error encountered',
    section: 'error handling',
  },
  {
    id: 'effect-orelse',
    name: 'Effect.orElse',
    description: 'Try one effect, and if it fails, fall back to another effect',
    section: 'error handling',
  },
  {
    id: 'effect-timeout',
    name: 'Effect.timeout',
    description: 'Add a time limit to an effect, failing with timeout if exceeded',
    section: 'error handling',
  },
  {
    id: 'effect-eventually',
    name: 'Effect.eventually',
    description: 'Run an effect repeatedly until it succeeds, ignoring errors',
    section: 'error handling',
  },
  {
    id: 'effect-partition',
    name: 'Effect.partition',
    description: 'Execute effects and partition results into successes and failures',
    section: 'error handling',
  },
  {
    id: 'effect-validate',
    name: 'Effect.validate',
    description: 'Accumulate validation errors instead of short-circuiting',
    section: 'error handling',
  },

  // Schedule
  {
    id: 'effect-repeat-spaced',
    name: 'Effect.repeat',
    description: 'Repeat an effect with a fixed delay between each execution',
    section: 'schedule',
    variant: 'spaced',
  },
  {
    id: 'effect-repeat-while-output',
    name: 'Effect.repeat',
    variant: 'whileOutput',
    description: 'Repeat while output matches a condition',
    section: 'schedule',
  },
  {
    id: 'effect-retry-recurs',
    name: 'Effect.retry',
    description: 'Retry an effect a fixed number of times',
    section: 'schedule',
    variant: 'recurs',
  },
  {
    id: 'effect-retry-exponential',
    name: 'Effect.retry',
    variant: 'exponential',
    description: 'Retry with exponential backoff',
    section: 'schedule',
  },

  // Ref
  {
    id: 'ref-make',
    name: 'Ref.make',
    description: 'Create a concurrency-safe mutable reference',
    section: 'ref',
  },
  {
    id: 'ref-update-and-get',
    name: 'Ref.updateAndGet',
    description: 'Update a ref and return the new value',
    section: 'ref',
  },

  // Scope
  {
    id: 'effect-add-finalizer',
    name: 'Effect.addFinalizer',
    description: 'Register cleanup actions in a scope',
    section: 'scope',
  },
  {
    id: 'effect-acquire-release',
    name: 'Effect.acquireRelease',
    description: 'Acquire resources with guaranteed cleanup',
    section: 'scope',
  },

  // Streams
  {
    id: 'stream-range',
    name: 'Stream.range',
    description: 'Collect a finite range of integers into a Chunk',
    section: 'streams',
  },
];

// Helper function to get metadata by ID
export function getExampleMeta(id: string): ExampleMeta | undefined {
  return examplesManifest.find((meta) => meta.id === id);
}
