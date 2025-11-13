'use client';

import { StarFourIcon } from '@phosphor-icons/react';
import { motion, useSpring, animate } from 'motion/react';
import { useLayoutEffect } from 'react';
import { springs } from '../../animations';

interface CompletionCheckPatternProps {
  size?: number;
}

export function CompletionCheckPattern({ size = 64 }: CompletionCheckPatternProps) {
  const contentScale = useSpring(1, springs.default);

  useLayoutEffect(() => {
    contentScale.set(0);
    animate(contentScale, [1.3, 1], springs.contentScale);
  }, [contentScale]);

  return (
    <motion.div
      className='bg-green-700 rounded-lg flex items-center justify-center'
      style={{
        width: size,
        height: size,
        scale: contentScale,
      }}
    >
      <StarFourIcon
        size={size * 0.5}
        color='rgba(255, 255, 255, 0.9)'
        weight='fill'
      />
    </motion.div>
  );
}
