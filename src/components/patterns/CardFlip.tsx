'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

// CardFlip: Two-sided card that flips on Y-axis
// Handles the flip animation and visibility swap at 90deg
export interface CardFlipProps {
  isFlipped: boolean;
  frontFace: ReactNode;
  backFace: ReactNode;
  size?: { width: number; height: number };
  onFlipComplete?: () => void;
  showPulsingBorder?: boolean;
}

export function CardFlip({
  isFlipped,
  frontFace,
  backFace,
  size = { width: 64, height: 88 },
  onFlipComplete,
  showPulsingBorder = false,
}: CardFlipProps) {
  const [showFront, setShowFront] = useState(!isFlipped);

  useEffect(() => {
    // At 90deg (halfway through flip), swap which face is visible
    const timeout = setTimeout(
      () => {
        setShowFront(isFlipped);
      },
      250, // Half of 500ms animation
    );

    return () => clearTimeout(timeout);
  }, [isFlipped]);

  return (
    <div
      style={{
        perspective: '1000px',
        width: size.width,
        height: size.height,
      }}
    >
      <motion.div
        style={{
          width: size.width,
          height: size.height,
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          scale: [1, 1.2, 1],
          z: [0, 30, 0],
        }}
        transition={{
          duration: 0.6,
          ease: 'easeInOut',
        }}
        onAnimationComplete={() => {
          if (onFlipComplete) {
            onFlipComplete();
          }
        }}
      >
        {/* Pulsing border - inside the rotating container */}
        {showPulsingBorder && (
          <motion.div
            className='absolute rounded-xl pointer-events-none'
            style={{
              inset: -2,
              border: '2px solid rgb(59, 130, 246)',
              boxShadow: '0 0 12px rgba(59, 130, 246, 0.5)',
              zIndex: 10,
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Back face (shown when not flipped) */}
        <motion.div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
          }}
          animate={{
            opacity: showFront ? 0 : 1,
          }}
          transition={{ duration: 0.1 }}
        >
          {backFace}
        </motion.div>

        {/* Front face (shown when flipped) */}
        <motion.div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          animate={{
            opacity: showFront ? 1 : 0,
          }}
          transition={{ duration: 0.1 }}
        >
          {frontFace}
        </motion.div>

        {/* Glow burst on flip completion - inside rotating container */}
        {isFlipped && (
          <motion.div
            className='absolute inset-0 rounded-xl pointer-events-none'
            style={{
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
              zIndex: 20,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, times: [0, 0.5, 1] }}
          />
        )}
      </motion.div>
    </div>
  );
}
