'use client';

import { SkullIcon } from '@phosphor-icons/react';
import { motion, useMotionValue, animate } from 'motion/react';
import { useEffect } from 'react';
import { shake } from '../../animations';

interface FailureShakePatternProps {
  size?: number;
}

export function FailureShakePattern({ size = 64 }: FailureShakePatternProps) {
  const shakeX = useMotionValue(0);
  const shakeY = useMotionValue(0);
  const rotation = useMotionValue(0);

  useEffect(() => {
    let cancelled = false;

    const shakeSequence = async () => {
      const { intensity, duration, count, rotationRange, returnDuration } = shake.failure;

      for (let i = 0; i < count && !cancelled; i++) {
        const xOffset = (Math.random() - 0.5) * intensity;
        const yOffset = (Math.random() - 0.5) * intensity;
        const rotOffset = (Math.random() - 0.5) * rotationRange;

        const anims = [
          animate(shakeX, xOffset, { duration, ease: 'easeInOut' }),
          animate(shakeY, yOffset, { duration, ease: 'easeInOut' }),
          animate(rotation, rotOffset, { duration, ease: 'easeInOut' }),
        ];
        await Promise.all(anims.map((a) => a.finished));
      }

      if (!cancelled) {
        await Promise.all([
          animate(shakeX, 0, { duration: returnDuration, ease: 'easeOut' }).finished,
          animate(shakeY, 0, { duration: returnDuration, ease: 'easeOut' }).finished,
          animate(rotation, 0, { duration: returnDuration, ease: 'easeOut' }).finished,
        ]);
      }
    };

    shakeSequence();

    return () => {
      cancelled = true;
    };
  }, [shakeX, shakeY, rotation]);

  return (
    <motion.div
      className='bg-red-600 rounded-lg flex items-center justify-center'
      style={{
        width: size,
        height: size,
        x: shakeX,
        y: shakeY,
        rotate: rotation,
      }}
    >
      <SkullIcon
        size={size * 0.5}
        color='rgba(255, 255, 255, 0.9)'
        weight='fill'
      />
    </motion.div>
  );
}
