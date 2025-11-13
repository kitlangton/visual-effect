'use client';

import {
  motion,
  useSpring,
  useMotionValue,
  useTransform,
  useVelocity,
  animate,
} from 'motion/react';
import { useEffect } from 'react';
import { timing, colors, shake } from '../../animations';
import { TASK_COLORS } from '../../constants/colors';

interface RunningStatePatternProps {
  size?: number;
}

export function RunningStatePattern({ size = 64 }: RunningStatePatternProps) {
  // All motion values
  const borderOpacity = useSpring(1, { stiffness: 180, damping: 25 });
  const glowIntensity = useSpring(0, { stiffness: 180, damping: 25 });
  const rotation = useMotionValue(0);
  const shakeX = useMotionValue(0);
  const shakeY = useMotionValue(0);
  const nodeHeight = useMotionValue(size);
  const borderRadius = useSpring(8, { stiffness: 180, damping: 25 });

  const rotationVelocity = useVelocity(rotation);
  const blurAmount = useTransform(rotationVelocity, [-100, 0, 100], [1, 0, 1], { clamp: true });

  // Shape morph
  useEffect(() => {
    animate(nodeHeight, size * 0.4, {
      duration: 0.4,
      bounce: 0.3,
      type: 'spring',
    });
    borderRadius.set(15);
  }, [nodeHeight, borderRadius, size]);

  // Border + glow pulses
  useEffect(() => {
    const borderAnim = animate(borderOpacity, [...timing.borderPulse.values], {
      duration: timing.borderPulse.duration,
      ease: 'easeInOut',
      repeat: Infinity,
    });

    const glowAnim = animate(glowIntensity, [...timing.glowPulse.values], {
      duration: timing.glowPulse.duration,
      ease: 'easeInOut',
      repeat: Infinity,
    });

    return () => {
      borderAnim.stop();
      glowAnim.stop();
    };
  }, [borderOpacity, glowIntensity]);

  // Jitter
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

  const boxShadow = useTransform([glowIntensity], ([glow = 0]: Array<number>) => {
    const cappedGlow = Math.min(glow, 8);
    return cappedGlow > 0 ? `0 0 ${cappedGlow}px ${colors.glow.running}` : 'none';
  });

  return (
    <motion.div
      className='relative overflow-hidden'
      style={{
        width: size,
        height: nodeHeight,
        borderRadius,
        rotate: rotation,
        x: shakeX,
        y: shakeY,
        scale: 0.95,
        opacity: 1,
        backgroundColor: TASK_COLORS.running,
        border: `1px solid ${colors.border.default}`,
        boxShadow,
        filter: useTransform([blurAmount], ([blur = 0]: Array<number>) => {
          const cappedBlur = Math.min(blur, 2);
          return `blur(${cappedBlur}px)`;
        }),
      }}
    >
      {/* Border overlay */}
      <motion.div
        className='absolute inset-0 pointer-events-none'
        style={{
          borderRadius,
          boxShadow: 'inset 0 0 0 1px rgba(100, 200, 255, 0.8)',
          opacity: borderOpacity,
        }}
      />

      {/* Light sweeps */}
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
    </motion.div>
  );
}
