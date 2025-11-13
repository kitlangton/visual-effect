'use client';

import { SkullIcon } from '@phosphor-icons/react';
import { motion, useSpring, useMotionValue } from 'motion/react';
import { useEffect } from 'react';
import { timing, effects } from '../../animations';

interface DeathGlitchPatternProps {
  size?: number;
}

export function DeathGlitchPattern({ size = 64 }: DeathGlitchPatternProps) {
  const contentScale = useSpring(1, { stiffness: 180, damping: 25 });
  const glowIntensity = useSpring(0, { stiffness: 180, damping: 25 });

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const scheduleIdle = (cb: () => void, delay: number) => {
      timeoutId = setTimeout(() => {
        const win = window as Window & { requestIdleCallback?: (cb: () => void) => number };
        if (typeof win.requestIdleCallback === 'function') {
          win.requestIdleCallback(cb);
        } else {
          cb();
        }
      }, delay);
    };

    const glitchSequence = async () => {
      const t = timing.glitch;
      const e = effects.glitch;

      // initial pulses
      for (let i = 0; i < t.initialCount && !cancelled; i++) {
        contentScale.set(1 + Math.random() * e.scaleRange);
        glowIntensity.set(Math.random() * e.intensePulseMax);

        await new Promise<void>((resolve) => {
          scheduleIdle(
            resolve,
            t.initialDelayMin + Math.random() * Math.max(0, t.initialDelayMax - t.initialDelayMin),
          );
        });

        if (cancelled) break;
        contentScale.set(1);
        glowIntensity.set(e.glowMax);

        await new Promise<void>((resolve) => {
          scheduleIdle(resolve, t.pauseMin + Math.random() * Math.max(0, t.pauseMax - t.pauseMin));
        });
      }

      // subtle loop
      const subtle = () => {
        if (cancelled) return;
        glowIntensity.set(e.glowMin + Math.random() * (e.glowMax - e.glowMin));
        scheduleIdle(
          subtle,
          t.subtleDelayMin + Math.random() * Math.max(0, t.subtleDelayMax - t.subtleDelayMin),
        );
      };
      subtle();
    };

    glitchSequence();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      glowIntensity.set(0);
    };
  }, [contentScale, glowIntensity]);

  return (
    <motion.div
      className='bg-red-900 rounded-lg flex items-center justify-center border-2'
      style={{
        width: size,
        height: size,
        borderColor: 'rgba(220, 38, 38, 0.4)',
        filter: `blur(0px) contrast(${effects.death.contrast}) brightness(${effects.death.brightness})`,
        scale: contentScale,
        boxShadow: `0 0 8px rgba(220, 38, 38, 0.8)`,
      }}
    >
      <SkullIcon
        size={size * 0.5}
        color='#dc2626'
        weight='fill'
      />
    </motion.div>
  );
}
