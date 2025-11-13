'use client';

import { motion } from 'motion/react';

interface ShapeMorphPatternProps {
  size?: number;
}

export function ShapeMorphPattern({ size = 64 }: ShapeMorphPatternProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        className='bg-gradient-to-br from-blue-500 to-blue-600'
        style={{
          width: size,
          border: '1px solid rgba(100, 200, 255, 0.5)',
        }}
        initial={{
          height: size,
          borderRadius: 8,
        }}
        animate={{
          height: [size, size * 0.4, size],
          borderRadius: [8, 15, 8],
        }}
        transition={{
          duration: 2,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
      />
    </div>
  );
}
