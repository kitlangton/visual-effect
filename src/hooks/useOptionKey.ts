import { useEffect, useState } from "react"

let globalOptionPressed = false
const subscribers: Set<(pressed: boolean) => void> = new Set()
let eventListenersAttached = false

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.altKey && !globalOptionPressed) {
    globalOptionPressed = true
    subscribers.forEach(callback => callback(true))
  }
}

const handleKeyUp = (e: KeyboardEvent) => {
  if (!e.altKey && globalOptionPressed) {
    globalOptionPressed = false
    subscribers.forEach(callback => callback(false))
  }
}

const attachEventListeners = () => {
  if (!eventListenersAttached) {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    eventListenersAttached = true
  }
}

const detachEventListeners = () => {
  if (eventListenersAttached && subscribers.size === 0) {
    window.removeEventListener("keydown", handleKeyDown)
    window.removeEventListener("keyup", handleKeyUp)
    eventListenersAttached = false
  }
}

/**
 * Hook to track the Option/Alt key state globally.
 * This ensures consistent state across all components that need to know about Option key presses.
 */
export function useOptionKey(): boolean {
  const [isOptionPressed, setIsOptionPressed] = useState(globalOptionPressed)

  useEffect(() => {
    // Add this component's callback to subscribers
    subscribers.add(setIsOptionPressed)

    // Attach global event listeners if this is the first subscriber
    attachEventListeners()

    // Sync with current global state
    setIsOptionPressed(globalOptionPressed)

    return () => {
      // Remove this component's callback from subscribers
      subscribers.delete(setIsOptionPressed)

      // Detach global event listeners if this was the last subscriber
      detachEventListeners()
    }
  }, [])

  return isOptionPressed
}
