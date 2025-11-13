'use client';

import { motion, useMotionValue, animate } from 'motion/react';
import { useEffect } from 'react';
import { timing, colors } from '../../animations';

interface FlashPatternProps {
  size?: number;
}

export function FlashPattern({ size = 64 }: FlashPatternProps) {
  const flashOpacity = useMotionValue(0);

  useEffect(() => {
    const up = animate(flashOpacity, 0.6, {
      duration: 0.02,
      ease: 'circOut',
    });
    up.finished.then(() => {
      animate(flashOpacity, 0, {
        duration: timing.flash.duration,
        ease: timing.flash.ease,
      });
    });
  }, [flashOpacity]);

  return (
    <div
      className='relative'
      style={{ width: size, height: size }}
    >
      <div className='absolute inset-0 bg-neutral-800 rounded-lg' />
      <motion.div
        className='absolute inset-0 rounded-lg pointer-events-none'
        style={{
          background: colors.flash,
          mixBlendMode: 'overlay',
          opacity: flashOpacity,
        }}
      />
    </div>
  );
}
