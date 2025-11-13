'use client';

import { motion, useSpring, animate, useTransform } from 'motion/react';
import { useEffect } from 'react';
import { timing, colors } from '../../animations';

interface GlowPulsePatternProps {
  size?: number;
  color?: string;
}

export function GlowPulsePattern({
  size = 64,
  color = colors.glow.running,
}: GlowPulsePatternProps) {
  const glowIntensity = useSpring(0, { stiffness: 180, damping: 25 });

  useEffect(() => {
    const anim = animate(glowIntensity, [...timing.glowPulse.values], {
      duration: timing.glowPulse.duration,
      ease: 'easeInOut',
      repeat: Infinity,
    });

    return () => {
      anim.stop();
    };
  }, [glowIntensity]);

  const boxShadow = useTransform([glowIntensity], ([glow = 0]: Array<number>) => {
    const cappedGlow = Math.min(glow, 8);
    return cappedGlow > 0 ? `0 0 ${cappedGlow}px ${color}` : 'none';
  });

  return (
    <motion.div
      className='bg-blue-500 rounded-lg'
      style={{
        width: size,
        height: size,
        boxShadow,
      }}
    />
  );
}
