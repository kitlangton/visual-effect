'use client';

import { motion, useMotionValue, useTransform, useVelocity, animate } from 'motion/react';
import { useEffect } from 'react';
import { shake } from '../../animations';

interface JitterPatternProps {
  size?: number;
}

export function JitterPattern({ size = 64 }: JitterPatternProps) {
  const rotation = useMotionValue(0);
  const shakeX = useMotionValue(0);
  const shakeY = useMotionValue(0);

  const rotationVelocity = useVelocity(rotation);
  const blurAmount = useTransform(rotationVelocity, [-100, 0, 100], [1, 0, 1], { clamp: true });

  useEffect(() => {
    let cancelled = false;
    let rafId: number | null = null;

    const jitter = () => {
      if (cancelled) return;

      const angle =
        (Math.random() * shake.running.angleRange + shake.running.angleBase) *
        (Math.random() < 0.5 ? 1 : -1);

      const offset =
        (Math.random() * shake.running.offsetRange + shake.running.offsetBase) *
        (Math.random() < 0.5 ? -1 : 1);

      const offsetY =
        (Math.random() * shake.running.offsetYRange + shake.running.offsetYBase) *
        (Math.random() < 0.5 ? -1 : 1);

      const min = shake.running.durationMin;
      const max = shake.running.durationMax ?? min * 2;
      const duration = min + Math.random() * Math.max(0.001, max - min);

      const rot = animate(rotation, angle, { duration, ease: 'circInOut' });
      const x = animate(shakeX, offset, { duration, ease: 'easeInOut' });
      const y = animate(shakeY, offsetY, { duration, ease: 'easeInOut' });

      Promise.all([rot.finished, x.finished, y.finished]).then(() => {
        if (cancelled) return;
        rafId = requestAnimationFrame(jitter);
      });
    };

    rafId = requestAnimationFrame(jitter);

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [rotation, shakeX, shakeY]);

  return (
    <motion.div
      className='bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold'
      style={{
        width: size,
        height: size,
        rotate: rotation,
        x: shakeX,
        y: shakeY,
        filter: useTransform([blurAmount], ([blur = 0]: Array<number>) => {
          const cappedBlur = Math.min(blur, 2);
          return `blur(${cappedBlur}px)`;
        }),
      }}
    >
      Jitter
    </motion.div>
  );
}
