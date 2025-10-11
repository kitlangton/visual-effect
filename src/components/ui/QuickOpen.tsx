import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

interface QuickOpenItem {
  id: string
  name: string
  variant?: string
  section: string
}

interface QuickOpenProps {
  /**
   * Items that can be searched and selected.
   */
  items: Array<QuickOpenItem>
  /**
   * Called with the `id` of the selected item.
   */
  onSelect: (id: string) => void
}

/**
 * Simple Command-K / Ctrl-K quick-open modal for navigating to Effect examples.
 *
 * This component adds a global keydown listener that toggles the modal with
 * ⌘K on macOS or Ctrl+K on other platforms. When open, the user can type to
 * filter examples, navigate with ↑/↓, and press Enter or click to select.
 */
export function QuickOpen({ items, onSelect }: QuickOpenProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [highlightIndex, setHighlightIndex] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [hasScroll, setHasScroll] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)

  // Basic case-insensitive substring search (computed early so it's available to effects)
  const filtered = items.filter(item => {
    const q = query.toLowerCase()
    return (
      item.name.toLowerCase().includes(q) ||
      (item.variant ? item.variant.toLowerCase().includes(q) : false) ||
      item.id.toLowerCase().includes(q)
    )
  })

  // Helper to highlight matched query text
  const highlight = useCallback(
    (text: string) => {
      if (!query) return text
      try {
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const regex = new RegExp(`(${escaped})`, "ig")
        const parts = text.split(regex)
        return parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="text-amber-400">
              {part}
            </span>
          ) : (
            part
          ),
        )
      } catch {
        // Fallback if regex fails
        return text
      }
    },
    [query],
  )

  // Open modal on Meta/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setIsOpen(prev => {
          const next = !prev
          if (next) {
            // Reset state when opening
            setQuery("")
            setHighlightIndex(0)
            setScrollTop(0)
            // Focus input after render
            setTimeout(() => {
              inputRef.current?.focus()
            }, 0)
          }
          return next
        })
      }
      // When open, handle navigation keys globally so that arrow keys work without focusing list.
      if (isOpen) {
        // Prevent other global handlers (keyboard navigation) from firing
        e.stopPropagation()
        if (e.key === "Escape") {
          e.preventDefault()
          setIsOpen(false)
        }
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setHighlightIndex(prev => Math.min(prev + 1, filtered.length - 1))
        }
        if (e.key === "ArrowUp") {
          e.preventDefault()
          setHighlightIndex(prev => Math.max(prev - 1, 0))
        }
        if (e.key === "Enter") {
          e.preventDefault()
          const item = filtered[highlightIndex]
          if (item) {
            choose(item.id)
          }
        }
      }
    }

    const opts: AddEventListenerOptions = { capture: true }
    window.addEventListener("keydown", handleKeyDown, opts)
    return () => window.removeEventListener("keydown", handleKeyDown, opts)
  }, [isOpen, highlightIndex, filtered])

  const choose = useCallback(
    (id: string) => {
      onSelect(id)
      setIsOpen(false)
    },
    [onSelect],
  )

  // Ensure highlight index is in bounds when list shrinks
  useEffect(() => {
    if (highlightIndex >= filtered.length) {
      setHighlightIndex(Math.max(0, filtered.length - 1))
    }
  }, [filtered.length, highlightIndex])

  // Ensure highlighted item stays within scroll viewport
  useEffect(() => {
    if (!isOpen) return
    const li = listRef.current?.querySelector<HTMLLIElement>(`li[data-idx="${highlightIndex}"]`)
    li?.scrollIntoView({ block: "nearest", behavior: "instant" })
  }, [highlightIndex, isOpen])

  // Initialize scrollbar when modal opens
  useEffect(() => {
    if (isOpen && listRef.current) {
      setScrollTop(listRef.current.scrollTop)
    }
  }, [isOpen, filtered.length])

  // Detect whether list overflows when modal opens or results change
  useEffect(() => {
    if (listRef.current) {
      const { clientHeight, scrollHeight } = listRef.current
      setHasScroll(scrollHeight > clientHeight)
    }
  }, [isOpen, filtered.length])

  // Handle scroll events for custom scrollbar
  const handleScroll = useCallback((e: React.UIEvent<HTMLUListElement>) => {
    const target = e.currentTarget
    setScrollTop(target.scrollTop)
  }, [])

  // Calculate scrollbar dimensions and position
  const scrollbarProps = useCallback(() => {
    if (!listRef.current) return { height: 0, top: 0, visible: false }

    const { clientHeight, scrollHeight, scrollTop } = listRef.current

    if (!hasScroll) return { height: 0, top: 0, visible: false }

    const scrollRatio = clientHeight / scrollHeight
    const thumbHeight = Math.max(clientHeight * scrollRatio, 20)
    const scrollRange = clientHeight - thumbHeight
    const scrollProgress = scrollTop / (scrollHeight - clientHeight)
    const thumbTop = scrollProgress * scrollRange

    return {
      height: thumbHeight,
      top: thumbTop,
      visible: hasScroll,
    }
  }, [scrollTop, hasScroll])

  const { height: thumbHeight, top: thumbTop, visible: scrollbarVisible } = scrollbarProps()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-40 bg-black/60 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-md mx-4 sm:mx-0 bg-neutral-900 border border-neutral-700/60 rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="p-4 border-b border-neutral-700/60">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setHighlightIndex(0)
            }}
            placeholder="Search effects…"
            className="w-full bg-transparent outline-none border-none placeholder-neutral-500 text-neutral-200 text-base"
          />
        </div>
        {/* Results list */}
        <ul
          ref={listRef}
          className="max-h-80 overflow-y-auto no-scrollbar"
          onScroll={handleScroll}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {filtered.length === 0 ? (
            <li className="p-4 text-neutral-500 text-sm">No results</li>
          ) : (
            (() => {
              const rows: Array<React.ReactNode> = []
              let currentSection: string | null = null
              filtered.slice(0, 50).forEach((item, idx) => {
                if (item.section !== currentSection) {
                  currentSection = item.section
                  rows.push(
                    <li
                      key={`header-${currentSection}`}
                      className="px-4 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wider pointer-events-none"
                    >
                      {currentSection}
                    </li>,
                  )
                }
                rows.push(
                  <li
                    key={item.id}
                    data-idx={idx}
                    onClick={() => choose(item.id)}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    className={`cursor-pointer px-4 py-3 text-sm sm:text-base flex gap-1
                      ${
                        idx === highlightIndex ? "bg-neutral-800" : "bg-transparent"
                      } hover:bg-neutral-800`}
                  >
                    <span className="text-neutral-200 font-medium flex gap-1 items-baseline">
                      <span>{highlight(item.name)}</span>
                      {item.variant ? (
                        <span className="text-sm text-neutral-500 ml-1">
                          {highlight(item.variant)}
                        </span>
                      ) : null}
                    </span>
                  </li>,
                )
              })
              return rows
            })()
          )}
        </ul>

        {/* Custom floating scrollbar */}
        {scrollbarVisible && (
          <div className="absolute right-1 top-16 bottom-1 w-1 pointer-events-none">
            <div
              className="bg-neutral-600 rounded-full transition-opacity duration-200"
              style={{
                height: `${thumbHeight}px`,
                transform: `translateY(${thumbTop}px)`,
                opacity: scrollbarVisible ? 0.6 : 0,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
