'use client';

import { motion } from 'motion/react';

interface ChunkCardStackProps {
  items: number[];
  pulling?: boolean;
  pushing?: boolean;
  label?: string;
}

export function ChunkCardStack({
  items,
  pulling = false,
  pushing = false,
  label = 'Source Queue',
}: ChunkCardStackProps) {
  return (
    <div className='space-y-2 flex-1'>
      <div className='text-sm text-neutral-400 font-mono'>{label}</div>
      <div className='relative min-h-[280px] flex items-end'>
        {items.length > 0 ? (
          <div
            className='relative'
            style={{ width: 80, height: 200 }}
          >
            {items.map((num, idx) => {
              const isBottom = idx === items.length - 1;
              const isTop = idx === 0;
              // Stack from bottom up with overlap
              const bottomOffset = idx * 12; // 12px offset per card
              return (
                <motion.div
                  key={`queue-${num}-${idx}`}
                  initial={{ opacity: 0, y: isTop && pushing ? -20 : -20, scale: 0.8 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    x: pulling && isBottom ? 20 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 180, damping: 25 }}
                  className='absolute'
                  style={{
                    bottom: bottomOffset,
                    left: 0,
                    width: 80,
                    height: 80,
                  }}
                >
                  <div
                    className='w-full h-full rounded-lg flex items-center justify-center font-mono text-2xl font-bold relative overflow-hidden'
                    style={{
                      background:
                        'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)',
                      boxShadow: isBottom
                        ? '0 0 16px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                        : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    {num}
                    {isBottom && (
                      <motion.div
                        className='absolute inset-0 rounded-lg'
                        animate={{
                          boxShadow: [
                            'inset 0 0 0 2px rgba(59, 130, 246, 0.8)',
                            'inset 0 0 0 2px rgba(59, 130, 246, 0.3)',
                            'inset 0 0 0 2px rgba(59, 130, 246, 0.8)',
                          ],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className='border-2 border-dashed border-neutral-700 rounded-lg w-20 h-20 flex items-center justify-center text-neutral-600 text-sm'>
            Empty
          </div>
        )}
      </div>
    </div>
  );
}
