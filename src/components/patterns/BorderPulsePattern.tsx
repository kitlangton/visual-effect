'use client';

import { motion, useSpring, animate } from 'motion/react';
import { useEffect } from 'react';
import { timing } from '../../animations';

interface BorderPulsePatternProps {
  size?: number;
  color?: string;
}

export function BorderPulsePattern({
  size = 64,
  color = 'rgba(100, 200, 255, 0.8)',
}: BorderPulsePatternProps) {
  const borderOpacity = useSpring(1, { stiffness: 180, damping: 25 });

  useEffect(() => {
    const anim = animate(borderOpacity, [...timing.borderPulse.values], {
      duration: timing.borderPulse.duration,
      ease: 'easeInOut',
      repeat: Infinity,
    });

    return () => {
      anim.stop();
    };
  }, [borderOpacity]);

  return (
    <div
      className='relative'
      style={{ width: size, height: size }}
    >
      <div
        className='absolute inset-0 bg-neutral-800 rounded-lg'
        style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
      />
      <motion.div
        className='absolute inset-0 rounded-lg pointer-events-none'
        style={{
          boxShadow: `inset 0 0 0 1px ${color}`,
          opacity: borderOpacity,
        }}
      />
    </div>
  );
}
