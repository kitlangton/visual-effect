import { AnimatePresence, motion, useSpring } from "motion/react"
import { useEffect, useRef } from "react"
import { taskSounds } from "@/sounds/TaskSounds"

interface VolumeToggleProps {
  isMuted: boolean
  onToggle: () => void
}

export function VolumeToggle({ isMuted, onToggle }: VolumeToggleProps) {
  const onRef = useRef<HTMLSpanElement>(null)
  const offRef = useRef<HTMLSpanElement>(null)
  const width = useSpring(0, { stiffness: 400, damping: 30 })

  useEffect(() => {
    // Measure the widths of ON and OFF text
    if (onRef.current && offRef.current) {
      const targetWidth = isMuted ? offRef.current.offsetWidth : onRef.current.offsetWidth
      width.set(targetWidth)
    }
  }, [isMuted, width])
  const handleToggle = async () => {
    // If currently muted and about to unmute, play success sound
    if (isMuted) {
      // First toggle to unmute
      onToggle()
      // Immediately update TaskSounds muted state to prevent race condition
      taskSounds.setMuted(false)
      // Then play the success sound (since sound is now enabled)
      await taskSounds.playSuccess()
    } else {
      // Toggle to mute and immediately update TaskSounds
      onToggle()
      taskSounds.setMuted(true)
    }
  }
  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex items-center gap-3 focus:outline-none cursor-pointer group"
      aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
    >
      {/* Text label with animated ON/OFF */}
      <div className="flex items-center gap-2">
        <span className="text-base font-mono font-bold text-neutral-400 select-none uppercase tracking-wide">
          SOUND
        </span>
        <motion.div
          className="relative flex items-center overflow-hidden"
          style={{ height: "1.2em", width }}
        >
          {/* Hidden measurement spans */}
          <span
            ref={onRef}
            className="text-base font-mono font-bold text-neutral-400 select-none uppercase tracking-wide inline-block absolute opacity-0 pointer-events-none"
            style={{ lineHeight: 1 }}
          >
            ON
          </span>
          <span
            ref={offRef}
            className="text-base font-mono font-bold text-neutral-400 select-none uppercase tracking-wide inline-block absolute opacity-0 pointer-events-none"
            style={{ lineHeight: 1 }}
          >
            OFF
          </span>

          <AnimatePresence mode="popLayout">
            <motion.span
              key={isMuted ? "off" : "on"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.2,
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
              className="text-base font-mono font-bold text-neutral-400 select-none uppercase tracking-wide inline-block absolute left-0"
              style={{ lineHeight: 1 }}
            >
              {isMuted ? "OFF" : "ON"}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* iOS-style toggle switch */}
      <div
        className="relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200"
        style={{
          backgroundColor: isMuted ? "rgb(82, 82, 82)" : "#22c55e", // neutral-600 when off, green-500 when on
        }}
      >
        <span
          className="inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm"
          style={{
            transform: isMuted ? "translateX(3px)" : "translateX(21px)",
          }}
        />
      </div>
    </button>
  )
}
