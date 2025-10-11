import { StarFourIcon } from "@phosphor-icons/react"
import { motion, useAnimationFrame, useMotionValue, useTransform, useVelocity } from "motion/react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { VolumeToggle } from "@/components/ui"

interface HeaderProps {
  isMuted: boolean
  onMuteToggle: () => void
}

export function PageHeader({ isMuted, onMuteToggle }: HeaderProps) {
  const [isHovering, setIsHovering] = useState(false)
  const rotation = useMotionValue(0)
  const velocity = useRef(770)
  const lastTime = useRef(performance.now())
  const router = useRouter()

  // Use velocity hook to track rotation velocity
  const rotationVelocity = useVelocity(rotation)

  // Map velocity to opacity: 0 deg/s = 0.6 opacity, 1200 deg/s = 1.0 opacity
  const opacity = useTransform(rotationVelocity, [0, 1200], [0.6, 1.0])

  useAnimationFrame(time => {
    const deltaTime = (time - lastTime.current) / 1000 // Convert to seconds
    lastTime.current = time
    const currentRotation = rotation.get()

    if (isHovering) {
      // Accelerate
      velocity.current = Math.min(velocity.current + 800 * deltaTime, 1200) // Max 1200 deg/s
      rotation.set(currentRotation + velocity.current * deltaTime)
    } else if (velocity.current > 0) {
      // Decelerate while still spinning
      velocity.current = Math.max(velocity.current - 400 * deltaTime, 0)
      rotation.set(currentRotation + velocity.current * deltaTime)
    } else if (Math.abs(currentRotation % 360) > 0.1) {
      // When stopped, smoothly return to neutral
      const normalizedRotation = currentRotation % 360
      const distanceToNeutral =
        normalizedRotation > 180 ? 360 - normalizedRotation : -normalizedRotation
      const returnSpeed = Math.min(Math.abs(distanceToNeutral) * 3, 200)
      const direction = distanceToNeutral > 0 ? 1 : -1

      rotation.set(currentRotation + direction * returnSpeed * deltaTime)

      // Snap when very close
      if (Math.abs(rotation.get() % 360) < 0.5) {
        rotation.set(Math.round(rotation.get() / 360) * 360)
      }
    }
  })

  return (
    <div className="self-start w-full flex items-start justify-between text-base">
      {/* Left side: Logo and title */}
      <button
        type="button"
        className="flex items-center gap-1.5 sm:gap-3 group select-none cursor-pointer"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => {
          // Use router.push for client-side navigation
          router.push("/")
        }}
      >
        <motion.div style={{ rotate: rotation, opacity }} className="flex items-center">
          <StarFourIcon size={16} weight="fill" />
        </motion.div>
        <span className="font-bold text-neutral-400 tracking-wide text-base">VISUAL EFFECT</span>
      </button>

      {/* Right side: Sound controls and credit */}
      <div className="flex items-end gap-1 flex-col">
        {/* Sound control */}
        <VolumeToggle isMuted={isMuted} onToggle={onMuteToggle} />
      </div>
    </div>
  )
}
