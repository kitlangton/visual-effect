'use client';

import { motion } from 'motion/react';

interface LightSweepPatternProps {
  size?: number;
}

export function LightSweepPattern({ size = 64 }: LightSweepPatternProps) {
  return (
    <div
      className='relative overflow-hidden bg-neutral-800 rounded-lg'
      style={{ width: size, height: size }}
    >
      {[0, 0.2, 0.4, 0.6, 0.8, 1].map((delay, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '200%',
            background:
              'linear-gradient(90deg, transparent 0%, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.1) 55%, transparent 60%, transparent 100%)',
            filter: 'blur(4px)',
            mixBlendMode: 'lighten',
          }}
          animate={{
            x: ['-66.0%', '50%'],
          }}
          transition={{
            duration: 0.8,
            delay,
            repeat: Infinity,
            ease: [0.5, 0, 0.1, 1],
          }}
        />
      ))}
    </div>
  );
}
