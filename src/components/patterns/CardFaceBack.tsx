'use client';

import { motion } from 'motion/react';

// CardFaceBack: Face-down card showing mystery/locked state
// Used for unrevealed chunks in the stack (face-down state)
export interface CardFaceBackProps {
  size?: { width: number; height: number };
}

export function CardFaceBack({ size = { width: 64, height: 88 } }: CardFaceBackProps) {
  return (
    <motion.div
      className='relative rounded-xl flex items-center justify-center overflow-hidden'
      style={{
        width: size.width,
        height: size.height,
        background: 'linear-gradient(135deg, rgb(67, 56, 202) 0%, rgb(79, 70, 229) 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.4)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Diagonal lines pattern overlay */}
      <svg
        className='absolute inset-0 w-full h-full'
        style={{ opacity: 0.1 }}
      >
        <defs>
          <pattern
            id='diagonal-lines'
            patternUnits='userSpaceOnUse'
            width='8'
            height='8'
            patternTransform='rotate(45)'
          >
            <line
              x1='0'
              y1='0'
              x2='0'
              y2='8'
              stroke='white'
              strokeWidth='2'
            />
          </pattern>
        </defs>
        <rect
          width='100%'
          height='100%'
          fill='url(#diagonal-lines)'
        />
      </svg>

      {/* Large question mark watermark */}
      <div
        className='absolute text-6xl font-bold text-white'
        style={{ opacity: 0.15 }}
      >
        ?
      </div>

      {/* Lock icon in center */}
      <div className='relative text-2xl'>🔒</div>
    </motion.div>
  );
}
