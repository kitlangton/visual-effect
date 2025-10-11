import { Effect } from "effect"
import { EmojiResult, TemperatureResult } from "../components/renderers"

/**
 * Generates a random delay with jitter for realistic network simulation
 * @param baseDelay - The base delay in milliseconds
 * @param jitter - The maximum jitter to add/subtract (default 300ms)
 * @returns A delay between baseDelay - jitter and baseDelay + jitter
 */
export function getDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Simulates fetching weather/temperature data with realistic network delay
 * @param baseDelay - Base delay in milliseconds (default 800ms)
 * @param location - Optional location name for the data
 * @returns An Effect that yields a TemperatureResult after a jittered delay
 */
export function getWeather(location?: string): Effect.Effect<TemperatureResult, never, never> {
  return Effect.gen(function* () {
    // Simulate network delay with jitter
    const delay = getDelay(500, 900)
    yield* Effect.sleep(delay)

    const temp = Math.floor(Math.random() * 30) + 60 // 60-90°F
    return new TemperatureResult(temp, location)
  })
}

export enum Emoji {
  Achilles = "🏃‍♂️",
  Tortoise = "🐢",
  Dog = "🐶",
  Cat = "🐱",
  Mouse = "🐭",
  Rabbit = "🐰",
  Fox = "🦊",
  Bear = "🐻",
  Panda = "🐼",
  Koala = "🐨",
  Lion = "🦁",
  Tiger = "🐯",
  Elephant = "🐮",
}

/**
 * Simulates fetching data from a CDN, returns a random animal emoji
 */
export function loadEmoji(emoji: Emoji) {
  return Effect.gen(function* () {
    const delay = getDelay(500, 900)
    yield* Effect.sleep(delay)

    return new EmojiResult(emoji)
  })
}

/**
 * Creates a stateful counter with reset functionality
 * @param initialValue - Initial counter value (default 0)
 * @returns Object with counter, increment, and reset effect
 */
export function createCounter(initialValue: number = 0) {
  let value = initialValue

  return {
    get current() {
      return value
    },
    increment() {
      value++
    },
    reset: Effect.sync(() => {
      value = initialValue
    }),
  }
}
