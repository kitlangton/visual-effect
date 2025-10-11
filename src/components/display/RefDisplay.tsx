import { AnimatePresence, motion, type Transition } from "motion/react"
import { useVisualRef, type VisualRef } from "@/VisualRef"

interface RefDisplayProps<A> {
  visualRef: VisualRef<A>
  style?: React.CSSProperties
}

export function RefDisplay<A>({ style = {}, visualRef }: RefDisplayProps<A>) {
  const { justChanged, value } = useVisualRef(visualRef)

  // Dynamic transition: quick flash in (50ms) then slow fade out (600ms)
  const transition: Transition = {
    visualDuration: justChanged ? 0.1 : 0.3,
    bounce: 0,
    type: "spring",
  }

  return (
    <div className="flex" style={{ ...style, position: "relative", flex: "1 1 auto" }}>
      <motion.div
        className="flex items-center  rounded-lg border"
        initial={{
          backgroundColor: "rgba(38, 38, 38, 0.8)",
          borderColor: "rgba(64, 64, 64, 0.5)",
        }}
        animate={{
          backgroundColor: justChanged
            ? "rgba(59, 130, 246, 0.3)" // brighter on flash
            : "rgba(38, 38, 38, 0.8)",
          borderColor: justChanged ? "rgba(59, 130, 246, 1)" : "rgba(64, 64, 64, 0.5)",
        }}
        transition={transition}
      >
        {/* Ref name */}
        <span className="text-md font-medium whitespace-nowrap text-neutral-400 p-2 px-4">
          {visualRef.name}
        </span>

        {/* Vertical separator */}
        <motion.span
          className="w-px h-full "
          initial={{ backgroundColor: "rgba(64, 64, 64, 0.5)" }}
          animate={{
            backgroundColor: justChanged ? "rgba(59, 130, 246, 0.3)" : "rgba(64, 64, 64, 0.5)",
          }}
          exit={{
            backgroundColor: "rgba(64, 64, 64, 0.5)",
            transition: { duration: 0.6, ease: "easeInOut" },
          }}
          transition={transition}
        />

        {/* Ref value with odometer-style transition */}
        <div className="text-md font-mono font-semibold text-neutral-100 min-w-0 overflow-hidden p-2 px-4">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={String(value)}
              initial={{ y: -8, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: 8, opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="inline-block"
            >
              {String(value)}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
