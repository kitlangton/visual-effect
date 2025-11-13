/**
 * TimelineTicksPattern - Background tick marks for timeline visualization
 * Shows vertical lines at regular intervals to mark time progression
 */

export interface TimelineTicksPatternProps {
  width: number
  height?: number
  spacing?: number
  tickWidth?: number
  color?: string
  className?: string
}

const DEFAULT_HEIGHT = 50
const DEFAULT_SPACING = 50
const DEFAULT_TICK_WIDTH = 1
const DEFAULT_COLOR = "var(--color-neutral-800)"

export function TimelineTicksPattern({
  width,
  height = DEFAULT_HEIGHT,
  spacing = DEFAULT_SPACING,
  tickWidth = DEFAULT_TICK_WIDTH,
  color = DEFAULT_COLOR,
  className = "",
}: TimelineTicksPatternProps) {
  const tickCount = Math.ceil(width / spacing)
  const ticks: React.ReactElement[] = []

  for (let i = 1; i <= tickCount; i++) {
    const x = i * spacing
    ticks.push(
      <div
        key={i}
        className="absolute"
        style={{
          left: `${x}px`,
          width: `${tickWidth}px`,
          height: `${height}px`,
          top: "0",
          backgroundColor: color,
        }}
      />,
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width: `${width}px`, height: `${height}px` }}>
      {ticks}
    </div>
  )
}
