'use client';

import { motion } from 'motion/react';
import { useState } from 'react';

export function StreamPushPullPrototype() {
  const [queue, setQueue] = useState([1, 2, 3, 4, 5]);
  const [consumed, setConsumed] = useState<number[]>([]);
  const [pulling, setPulling] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [nextValue, setNextValue] = useState(6);

  const handlePull = () => {
    if (queue.length === 0 || pulling) return;

    setPulling(true);

    // Animate the pull - pull from bottom (last item)
    setTimeout(() => {
      const next = queue[queue.length - 1];
      setConsumed((prev) => [...prev, next]);
      setQueue(queue.slice(0, -1));
      setPulling(false);
    }, 400);
  };

  const handlePush = () => {
    if (pushing) return;

    setPushing(true);

    // Animate the push - add to top
    setTimeout(() => {
      setQueue((prev) => [nextValue, ...prev]);
      setNextValue((prev) => prev + 1);
      setPushing(false);
    }, 400);
  };

  const handleReset = () => {
    setQueue([1, 2, 3, 4, 5]);
    setConsumed([]);
    setPulling(false);
    setPushing(false);
    setNextValue(6);
  };

  const isExhausted = queue.length === 0;

  return (
    <div className='space-y-6'>
      {/* Visual Layout */}
      <div className='flex items-start justify-between gap-8 p-6 relative'>
        {/* Cloud Push Source */}
        <div className='flex flex-col items-center gap-3'>
          <motion.button
            type='button'
            onClick={handlePush}
            disabled={pushing}
            whileHover={!pushing ? { scale: 1.05 } : {}}
            whileTap={!pushing ? { scale: 0.95 } : {}}
            animate={{
              scale: pushing ? 1.1 : 1,
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className='relative'
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgb(168, 85, 247) 0%, rgb(126, 34, 206) 100%)',
              border: '2px solid rgba(168, 85, 247, 0.5)',
              boxShadow: '0 0 24px rgba(168, 85, 247, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)',
              cursor: pushing ? 'not-allowed' : 'pointer',
            }}
          >
            <span className='text-2xl'>{pushing ? '💫' : '☁️'}</span>
            {!pushing && (
              <motion.div
                className='absolute inset-0 rounded-full'
                animate={{
                  boxShadow: [
                    '0 0 0 0px rgba(168, 85, 247, 0.4)',
                    '0 0 0 8px rgba(168, 85, 247, 0)',
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            )}
          </motion.button>
          <div className='text-xs font-mono font-bold tracking-wide'>PUSH</div>
          <div
            className='text-xs font-mono text-purple-400'
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(168, 85, 247, 0.1)',
            }}
          >
            Next: {nextValue}
          </div>
        </div>

        {pushing && <PushBeam />}

        <ChunkStack
          items={queue}
          pulling={pulling}
          pushing={pushing}
        />
        <PullLever
          onPull={handlePull}
          active={!isExhausted && !pulling}
          pulling={pulling}
        />
        <ConsumedRail items={consumed} />
        {pulling && <TransferBeam />}
      </div>

      {/* Controls */}
      <div className='flex gap-2'>
        <button
          type='button'
          onClick={handleReset}
          className='px-4 py-2 bg-neutral-600 hover:bg-neutral-700 rounded'
        >
          Reset
        </button>
        <div className='flex-1' />
        <div className='text-sm text-neutral-400 font-mono'>
          Queue: {queue.length} | Consumed: {consumed.length}
        </div>
      </div>
    </div>
  );
}

function ChunkStack({
  items,
  pulling,
  pushing,
}: {
  items: number[];
  pulling: boolean;
  pushing?: boolean;
}) {
  return (
    <div className='space-y-2 flex-1'>
      <div className='text-sm text-neutral-400 font-mono'>Source Queue</div>
      <div className='flex flex-col gap-3 min-h-[280px]'>
        {items.length > 0 ? (
          items.map((num, idx) => {
            const isBottom = idx === items.length - 1;
            const isTop = idx === 0;
            return (
              <ChunkBadgeItem
                key={`queue-${num}-${idx}`}
                num={num}
                isBottom={isBottom}
                isTop={isTop}
                pulling={pulling && isBottom}
                pushing={pushing && isTop}
              />
            );
          })
        ) : (
          <div className='border-2 border-dashed border-neutral-700 rounded-lg h-16 flex items-center justify-center text-neutral-600 text-sm'>
            Empty
          </div>
        )}
      </div>
    </div>
  );
}

function ChunkBadgeItem({
  num,
  isBottom,
  isTop,
  pulling,
  pushing,
}: {
  num: number;
  isBottom: boolean;
  isTop?: boolean;
  pulling: boolean;
  pushing?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: pushing ? -20 : 0 }}
      animate={{
        opacity: isBottom ? 1 : 0.5,
        scale: 1,
        x: pulling ? 20 : 0,
        y: 0,
      }}
      transition={{ type: 'spring', stiffness: 180, damping: 25 }}
      className='relative'
      style={{
        width: 64,
        height: 64,
      }}
    >
      <div
        className='w-full h-full rounded-lg flex items-center justify-center font-mono text-xl font-bold relative overflow-hidden'
        style={{
          background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)',
          boxShadow: isBottom
            ? '0 0 16px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
            : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {num}
        {isBottom && (
          <motion.div
            className='absolute inset-0 rounded-lg'
            animate={{
              boxShadow: [
                'inset 0 0 0 1px rgba(59, 130, 246, 0.8)',
                'inset 0 0 0 1px rgba(59, 130, 246, 0.3)',
                'inset 0 0 0 1px rgba(59, 130, 246, 0.8)',
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
}

function PullLever({
  onPull,
  active,
  pulling,
}: {
  onPull: () => void;
  active: boolean;
  pulling: boolean;
}) {
  return (
    <div className='flex flex-col items-center gap-3'>
      <motion.button
        type='button'
        onClick={onPull}
        disabled={!active}
        whileHover={active ? { scale: 1.05 } : {}}
        whileTap={active ? { scale: 0.95 } : {}}
        animate={{
          scale: pulling ? 1.1 : 1,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className='relative'
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: active
            ? 'linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)'
            : 'linear-gradient(135deg, rgb(64, 64, 64) 0%, rgb(38, 38, 38) 100%)',
          border: `2px solid ${active ? 'rgba(34, 197, 94, 0.5)' : 'rgba(115, 115, 115, 0.3)'}`,
          boxShadow: active
            ? '0 0 24px rgba(34, 197, 94, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)'
            : '0 2px 8px rgba(0,0,0,0.3)',
          cursor: active ? 'pointer' : 'not-allowed',
        }}
      >
        <span className='text-2xl'>{pulling ? '⚡' : '⬇'}</span>
        {active && !pulling && (
          <motion.div
            className='absolute inset-0 rounded-full'
            animate={{
              boxShadow: ['0 0 0 0px rgba(34, 197, 94, 0.4)', '0 0 0 8px rgba(34, 197, 94, 0)'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </motion.button>
      <div className='text-xs font-mono font-bold tracking-wide'>PULL</div>
      <div
        className={`text-xs font-mono ${active ? 'text-green-400' : 'text-red-400'}`}
        style={{
          padding: '2px 8px',
          borderRadius: '4px',
          background: active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        }}
      >
        {active ? 'Active' : 'Exhausted'}
      </div>
    </div>
  );
}

function ConsumedRail({ items }: { items: number[] }) {
  return (
    <div className='space-y-2 flex-1'>
      <div className='text-sm text-neutral-400 font-mono'>Consumed</div>
      <div className='flex flex-wrap gap-3 min-h-[280px] content-start'>
        {items.length > 0 ? (
          items.map((num, idx) => (
            <motion.div
              key={`consumed-${num}-${idx}`}
              initial={{ opacity: 0, x: -20, scale: 0.8 }}
              animate={{ opacity: idx === items.length - 1 ? 1 : 0.6, x: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 25 }}
              className='relative'
              style={{
                width: 64,
                height: 64,
              }}
            >
              <div
                className='w-full h-full rounded-lg flex items-center justify-center font-mono text-xl font-bold'
                style={{
                  background: 'linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)',
                  boxShadow:
                    idx === items.length - 1
                      ? '0 0 16px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                      : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                {num}
              </div>
            </motion.div>
          ))
        ) : (
          <div className='border-2 border-dashed border-neutral-700 rounded-lg w-16 h-16 flex items-center justify-center text-neutral-600 text-sm'>
            ∅
          </div>
        )}
      </div>
    </div>
  );
}

function TransferBeam() {
  return (
    <motion.div
      className='absolute top-1/2 left-1/2 right-1/4'
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: [0, 1, 1, 0], scaleX: [0, 1, 1, 0] }}
      transition={{ duration: 0.4, times: [0, 0.2, 0.8, 1] }}
      style={{
        height: 4,
        background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.8), rgba(34, 197, 94, 0.8))',
        borderRadius: 2,
        boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
        transformOrigin: 'left center',
      }}
    />
  );
}

function PushBeam() {
  return (
    <motion.div
      className='absolute top-[80px] left-[120px] right-auto'
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: [0, 1, 1, 0], scaleX: [0, 1, 1, 0] }}
      transition={{ duration: 0.4, times: [0, 0.2, 0.8, 1] }}
      style={{
        height: 4,
        width: 150,
        background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.8), rgba(59, 130, 246, 0.8))',
        borderRadius: 2,
        boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)',
        transformOrigin: 'left center',
      }}
    />
  );
}
