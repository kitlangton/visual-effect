'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ChunkCardStack } from '../patterns/ChunkCardStack';

export function StreamPullPrototype() {
  const [queue, setQueue] = useState<number[]>([]);
  const [consumed, setConsumed] = useState<number[]>([]);
  const [pulling, setPulling] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize queue by adding items one at a time
  // Array order: [newest/top=5, ..., oldest/bottom=1]
  // We add from oldest to newest, so 1 goes in first (will be at bottom)
  useEffect(() => {
    let currentIndex = 1;

    const interval = setInterval(() => {
      if (currentIndex <= 5) {
        setQueue((prev) => [currentIndex, ...prev]); // Add to front (top of stack)
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsInitializing(false);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

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

  const handleReset = () => {
    setQueue([]);
    setConsumed([]);
    setPulling(false);
    setIsInitializing(true);

    // Re-initialize
    setTimeout(() => {
      let currentIndex = 1;

      const interval = setInterval(() => {
        if (currentIndex <= 5) {
          setQueue((prev) => [currentIndex, ...prev]);
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsInitializing(false);
        }
      }, 150);
    }, 100);
  };

  const isExhausted = queue.length === 0 && !isInitializing;

  return (
    <div className='space-y-6'>
      {/* Visual Layout */}
      <div className='flex items-start justify-between gap-8 p-6 relative'>
        <ChunkCardStack
          items={queue}
          pulling={pulling}
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
      className='absolute top-1/2 left-1/4 right-1/4'
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
