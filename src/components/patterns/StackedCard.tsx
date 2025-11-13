'use client';

import { motion } from 'motion/react';
import { CardFaceBack } from './CardFaceBack';
import { CardFaceFront } from './CardFaceFront';
import { CardFlip } from './CardFlip';

// StackedCard: Card positioned within a stack with offset and rotation
// Combines CardFlip with stack positioning logic
export interface StackedCardProps {
  value: number;
  stackIndex: number;
  totalInStack: number;
  isFlipped: boolean;
  pulling?: boolean;
  pushing?: boolean;
  size?: { width: number; height: number };
}

export function StackedCard({
  value,
  stackIndex,
  totalInStack,
  isFlipped,
  pulling = false,
  pushing = false,
  size = { width: 64, height: 88 },
}: StackedCardProps) {
  // Calculate offset - each card is slightly offset from the one below
  const offsetY = stackIndex * 10;

  // Small random tilt based on index for natural stack feel
  // Use deterministic rotation based on value to keep consistent
  const rotation = ((value * 37) % 7) - 3; // Range: -3° to +3°

  // Bottom card (stackIndex === 0) gets pulsing highlight
  const isBottom = stackIndex === 0;

  // Pulling animation: slide right before flip
  const pullingX = pulling ? 40 : 0;

  // Pushing animation: slide in from above with rotation
  const pushingY = pushing ? -80 : 0;
  const pushingRotation = pushing ? -15 : 0;

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: totalInStack - stackIndex,
      }}
      animate={{
        y: offsetY + pushingY,
        x: pullingX,
        rotate: rotation + pushingRotation,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      <CardFlip
        isFlipped={isFlipped}
        frontFace={
          <CardFaceFront
            value={value}
            size={size}
          />
        }
        backFace={<CardFaceBack size={size} />}
        size={size}
        showPulsingBorder={isBottom}
      />
    </motion.div>
  );
}
