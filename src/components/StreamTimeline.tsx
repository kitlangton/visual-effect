import { motion } from 'motion/react';

export interface StreamTimelineProps {
  dotCount: number;
  activeIndex: number;
  isComplete: boolean;
  className?: string;
}

const DOT_SIZE = 12;
const LINE_HEIGHT = 3;
const DOT_SPACING = 32;

const COLORS = {
  line: 'var(--color-neutral-700)',
  dotInactive: 'var(--color-neutral-600)',
  dotActive: 'var(--color-blue-400)',
  dotComplete: 'var(--color-green-500)',
};

const ANIMATION = {
  dot: {
    duration: 0.3,
    ease: 'easeOut',
  },
  scale: {
    type: 'spring',
    visualDuration: 0.4,
    bounce: 0.3,
  },
} as const;

export function StreamTimeline({
  dotCount,
  activeIndex,
  isComplete,
  className = '',
}: StreamTimelineProps) {
  const timelineWidth = Math.max(0, (dotCount - 1) * DOT_SPACING);

  return (
    <div
      className={`relative ${className}`}
      style={{ height: `${DOT_SIZE}px` }}
    >
      {/* Horizontal line */}
      <div
        className='absolute top-1/2 -translate-y-1/2'
        style={{
          left: 0,
          width: `${timelineWidth}px`,
          height: `${LINE_HEIGHT}px`,
          backgroundColor: COLORS.line,
          borderRadius: `${LINE_HEIGHT / 2}px`,
        }}
      />

      {/* Dots */}
      {Array.from({ length: dotCount }, (_, i) => {
        const isActive = i === activeIndex;
        const isPast = isComplete || i < activeIndex;

        let dotColor = COLORS.dotInactive;
        if (isComplete) {
          dotColor = COLORS.dotComplete;
        } else if (isActive) {
          dotColor = COLORS.dotActive;
        } else if (isPast) {
          dotColor = COLORS.dotComplete;
        }

        return (
          <motion.div
            key={i}
            className='absolute top-1/2 -translate-y-1/2 rounded-full'
            style={{
              left: `${i * DOT_SPACING}px`,
              width: `${DOT_SIZE}px`,
              height: `${DOT_SIZE}px`,
              marginLeft: `-${DOT_SIZE / 2}px`,
            }}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{
              backgroundColor: dotColor,
              scale: isActive ? 1.2 : 1,
              opacity: 1,
            }}
            transition={{
              backgroundColor: ANIMATION.dot,
              opacity: ANIMATION.dot,
              scale: ANIMATION.scale,
            }}
          />
        );
      })}
    </div>
  );
}
