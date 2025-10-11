import { HashStraightIcon } from "@phosphor-icons/react"
import { memo, useMemo } from "react"

interface Example {
  id: string
  name: string
  variant?: string
  section?: string
}

interface NavigationSidebarProps {
  examples: Array<Example>
  currentExample?: string | undefined
  onExampleSelect: (id: string) => void
}

function NavigationSidebarComponent({
  currentExample,
  examples,
  onExampleSelect,
}: NavigationSidebarProps) {
  // Group examples by section - memoize to avoid recomputation
  const sections = useMemo(
    () =>
      examples.reduce(
        (acc, example) => {
          const section = example.section || "Other"
          if (!acc[section]) {
            acc[section] = []
          }
          acc[section].push(example)
          return acc
        },
        {} as Record<string, Array<Example>>,
      ),
    [examples],
  )

  return (
    <aside
      className="fixed top-0 w-76 h-screen z-40 hidden xl:block"
      style={{ left: "max(0px, calc(50vw - 40rem))" }}
    >
      <div className="h-full overflow-y-auto border-r border-neutral-800">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-sm font-mono text-neutral-500 mb-4">EXAMPLES</h2>
          </div>

          <div>
            {Object.entries(sections).map(([sectionName, sectionExamples]) => (
              <div key={sectionName} className="mb-8">
                <h3 className="text-xs font-mono text-neutral-600 mb-3 font-bold tracking-wider">
                  <span className="flex items-center gap-1">
                    <HashStraightIcon size={14} />
                    {sectionName.toUpperCase()}
                  </span>
                </h3>
                <nav className="space-y-1">
                  {sectionExamples.map(example => {
                    const isActive = currentExample === example.id

                    return (
                      <button
                        type="button"
                        key={example.id}
                        onClick={() => onExampleSelect(example.id)}
                        className={`
                          w-full text-left py-1 px-2 -mx-2 text-sm font-mono cursor-pointer rounded-md 
                          ${
                            isActive
                              ? "text-white"
                              : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
                          }
                          focus:outline-none
                        `}
                      >
                        <span className="flex items-baseline gap-1.5">
                          <span>{example.name}</span>
                          {example.variant && (
                            <span className="text-xs text-neutral-500">{example.variant}</span>
                          )}
                        </span>
                      </button>
                    )
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

// Memoize the component to prevent re-renders when props don't change
export const NavigationSidebar = memo(NavigationSidebarComponent)
