'use client';

import { StarFourIcon } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { TASK_COLORS } from '../../constants/colors';

interface IdleStatePatternProps {
  size?: number;
}

export function IdleStatePattern({ size = 64 }: IdleStatePatternProps) {
  return (
    <motion.div
      className='rounded-lg flex items-center justify-center'
      style={{
        width: size,
        height: size,
        scale: 1,
        opacity: 0.6,
        backgroundColor: TASK_COLORS.idle,
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
