'use client';

import { motion } from 'motion/react';

// CardFaceFront: Playing card aspect ratio showing the chunk value
// Used for revealed chunks in the stack (face-up state)
export interface CardFaceFrontProps {
  value: number;
  size?: { width: number; height: number };
}

export function CardFaceFront({ value, size = { width: 64, height: 88 } }: CardFaceFrontProps) {
  return (
    <motion.div
      className='relative rounded-xl flex items-center justify-center'
      style={{
        width: size.width,
        height: size.height,
        background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(29, 78, 216) 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Optional small value label in top-left */}
      <div
        className='absolute top-1 left-1.5 text-xs font-mono font-semibold text-white'
        style={{ opacity: 0.6 }}
      >
        {value}
      </div>

      {/* Main centered number */}
      <div className='text-3xl font-bold font-mono text-white drop-shadow-lg'>{value}</div>
    </motion.div>
  );
}
