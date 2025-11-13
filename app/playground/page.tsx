'use client';

import { Chunk, Effect } from 'effect';
import { motion } from 'motion/react';
import { useState } from 'react';
import { EffectNode } from '../../src/components/effect';
import {
  BorderPulsePattern,
  CompletionCheckPattern,
  DeathGlitchPattern,
  FailureShakePattern,
  FlashPattern,
  GlowPulsePattern,
  IdleStatePattern,
  InteractiveRetryTimelineDemo,
  JitterPattern,
  LightSweepPattern,
  RunningStatePattern,
  ShapeMorphPattern,
  TimelineDotPattern,
  TimelineSegmentPattern,
  TimelineTicksPattern,
} from '../../src/components/patterns';
import {
  ChunkBadge,
  ChunkResult,
  EmojiResult,
  NumberResult,
  StringResult,
  TemperatureResult,
} from '../../src/components/renderers';
import { StreamTimeline } from '../../src/components/StreamTimeline';
import { VisualEffect } from '../../src/VisualEffect';

export default function PlaygroundPage() {
  // StreamTimeline state
  const [dotCount, setDotCount] = useState(5);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // EffectNode states
  const [simpleEffect] = useState(() => {
    const effect = new VisualEffect('simpleEffect', Effect.succeed(new NumberResult(42)));
    return effect;
  });

  const [customLabelEffect] = useState(() => {
    const effect = new VisualEffect(
      'customLabelEffect',
      Effect.succeed(new StringResult('Custom!')),
    );
    return effect;
  });

  const [runningEffect] = useState(() => {
    const effect = new VisualEffect(
      'runningEffect',
      Effect.gen(function* () {
        yield* Effect.sleep(10000); // long running
        return new NumberResult(100);
      }),
    );
    return effect;
  });

  const [failedEffect] = useState(() => {
    const effect = new VisualEffect<NumberResult, string>(
      'failedEffect',
      Effect.fail('Something went wrong'),
    );
    return effect;
  });

  // Chunk examples
  const smallChunk = Chunk.make(1, 2, 3);
  const largeChunk = Chunk.make('A', 'B', 'C', 'D', 'E', 'F');

  const handleNextDot = () => {
    if (activeIndex < dotCount - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
  };

  const handleReset = () => {
    setActiveIndex(0);
    setIsComplete(false);
  };

  const handleRunSimple = () => {
    simpleEffect.reset();
    simpleEffect.run();
  };

  const handleRunCustom = () => {
    customLabelEffect.reset();
    customLabelEffect.run();
  };

  const handleRunLongRunning = () => {
    runningEffect.reset();
    runningEffect.run();
  };

  const handleRunFailed = () => {
    failedEffect.reset();
    failedEffect.run();
  };

  return (
    <div className='min-h-screen bg-neutral-900 text-white p-8'>
      <div className='max-w-6xl mx-auto space-y-12'>
        {/* Header */}
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold'>Component Playground</h1>
          <p className='text-neutral-400'>Visual showcase of atomic components in isolation</p>
        </div>

        {/* StreamTimeline Section */}
        <section className='space-y-4 border border-neutral-700 rounded-lg p-6 bg-neutral-800/50'>
          <h2 className='text-xl font-semibold text-blue-400'>StreamTimeline</h2>
          <div className='flex items-center gap-8'>
            <div className='flex-1'>
              <StreamTimeline
                dotCount={dotCount}
                activeIndex={activeIndex}
                isComplete={isComplete}
              />
            </div>
          </div>
          <div className='flex gap-2 flex-wrap'>
            <button
              type='button'
              onClick={handleNextDot}
              disabled={activeIndex >= dotCount - 1 || isComplete}
              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded'
            >
              Next Dot
            </button>
            <button
              type='button'
              onClick={handleComplete}
              disabled={isComplete}
              className='px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded'
            >
              Complete
            </button>
            <button
              type='button'
              onClick={handleReset}
              className='px-4 py-2 bg-neutral-600 hover:bg-neutral-700 rounded'
            >
              Reset
            </button>
            <button
              type='button'
              onClick={() => setDotCount(Math.max(2, dotCount - 1))}
              className='px-4 py-2 bg-neutral-600 hover:bg-neutral-700 rounded'
            >
              Fewer Dots
            </button>
            <button
              type='button'
              onClick={() => setDotCount(Math.min(10, dotCount + 1))}
              className='px-4 py-2 bg-neutral-600 hover:bg-neutral-700 rounded'
            >
              More Dots
            </button>
          </div>
          <div className='text-sm text-neutral-400 font-mono'>
            State: {dotCount} dots, active: {activeIndex}, complete: {isComplete ? 'yes' : 'no'}
          </div>
        </section>

        {/* Basic Result Renderers */}
        <section className='space-y-4 border border-neutral-700 rounded-lg p-6 bg-neutral-800/50'>
          <h2 className='text-xl font-semibold text-blue-400'>Basic Result Renderers</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
            <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
              <div className='text-xs text-neutral-500 uppercase'>NumberResult</div>
              {new NumberResult(42).render()}
            </div>
            <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
              <div className='text-xs text-neutral-500 uppercase'>StringResult</div>
              {new StringResult('Hello').render()}
            </div>
            <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
              <div className='text-xs text-neutral-500 uppercase'>EmojiResult</div>
              {new EmojiResult('🚀').render()}
            </div>
            <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
              <div className='text-xs text-neutral-500 uppercase'>TemperatureResult</div>
              {new TemperatureResult(72, 'San Francisco').render()}
            </div>
          </div>
        </section>

        {/* Chunk Renderers */}
        <section className='space-y-4 border border-neutral-700 rounded-lg p-6 bg-neutral-800/50'>
          <h2 className='text-xl font-semibold text-blue-400'>Chunk Renderers</h2>
          <div className='grid md:grid-cols-2 gap-6'>
            <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
              <div className='text-xs text-neutral-500 uppercase'>ChunkBadge (small)</div>
              {new ChunkBadge(smallChunk).render()}
            </div>
            <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
              <div className='text-xs text-neutral-500 uppercase'>ChunkBadge (large)</div>
              {new ChunkBadge(largeChunk).render()}
            </div>
            <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
              <div className='text-xs text-neutral-500 uppercase'>ChunkResult (small)</div>
              {new ChunkResult(smallChunk).render()}
            </div>
            <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
              <div className='text-xs text-neutral-500 uppercase'>ChunkResult (large)</div>
              {new ChunkResult(largeChunk).render()}
            </div>
          </div>
        </section>

        {/* Timeline Patterns */}
        <section className='space-y-4 border border-neutral-700 rounded-lg p-6 bg-neutral-800/50'>
          <h2 className='text-xl font-semibold text-blue-400'>Timeline Patterns</h2>
          <p className='text-neutral-400 text-sm'>
            Visual patterns for showing time-based Effect operations (retry, repeat, scheduling)
          </p>

          {/* Atomic Timeline Components */}
          <div>
            <h3 className='text-lg font-semibold text-green-400 mb-3'>
              Atomic Timeline Components
            </h3>
            <div className='grid gap-6'>
              {/* Timeline Ticks */}
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase'>Timeline Ticks (Grid)</div>
                <div className='overflow-x-auto'>
                  <TimelineTicksPattern
                    width={600}
                    height={50}
                  />
                </div>
              </div>

              {/* Timeline Dots */}
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase'>Timeline Dots (States)</div>
                <div className='overflow-x-auto'>
                  <div
                    className='relative'
                    style={{ height: '50px', width: '400px', minWidth: '400px' }}
                  >
                    <TimelineDotPattern
                      x={100}
                      state='idle'
                    />
                    <TimelineDotPattern
                      x={200}
                      state='active'
                    />
                    <TimelineDotPattern
                      x={300}
                      state='complete'
                    />
                  </div>
                </div>
                <div className='flex gap-4 text-xs text-neutral-400 font-mono mt-2'>
                  <span>Idle (neutral)</span>
                  <span>Active (blue, larger)</span>
                  <span>Complete (blue)</span>
                </div>
              </div>

              {/* Timeline Segments */}
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase'>Timeline Segments</div>
                <div className='overflow-x-auto'>
                  <div
                    className='relative'
                    style={{ height: '100px', width: '600px', minWidth: '600px' }}
                  >
                    <TimelineSegmentPattern
                      startX={50}
                      endX={200}
                      state='complete'
                      showDots={true}
                    />
                    <TimelineSegmentPattern
                      startX={250}
                      endX={450}
                      state='active'
                      showDots={true}
                    />
                    <TimelineSegmentPattern
                      startX={250}
                      endX={450}
                      y='70%'
                      color='var(--color-neutral-500)'
                      state='complete'
                      showDots={false}
                      showDuration={true}
                      duration={1200}
                    />
                  </div>
                </div>
                <div className='flex gap-4 text-xs text-neutral-400 font-mono mt-2'>
                  <span>Complete segment</span>
                  <span>Active segment</span>
                  <span>Gap with duration label</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Retry Timeline */}
          <div>
            <h3 className='text-lg font-semibold text-cyan-400 mb-3'>Interactive Retry Timeline</h3>
            <div className='space-y-2'>
              <div className='text-xs text-neutral-400'>
                Complete retry visualization with exponential backoff, matching Effect.retry
                behavior
              </div>
              <InteractiveRetryTimelineDemo />
            </div>
          </div>
        </section>

        {/* Atomic Effect Patterns */}
        <section className='space-y-4 border border-neutral-700 rounded-lg p-6 bg-neutral-800/50'>
          <h2 className='text-xl font-semibold text-blue-400'>Atomic Effect Patterns</h2>
          <p className='text-neutral-400 text-sm'>
            Individual visual patterns decomposed from EffectNode states
          </p>

          {/* Full State Patterns */}
          <div>
            <h3 className='text-lg font-semibold text-green-400 mb-3'>Full State Compositions</h3>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase text-center'>Idle State</div>
                <div className='flex justify-center items-center h-20'>
                  <IdleStatePattern />
                </div>
              </div>
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase text-center'>
                  Running (All Patterns)
                </div>
                <div className='flex justify-center items-center h-20'>
                  <RunningStatePattern />
                </div>
              </div>
            </div>
          </div>

          {/* Individual Running Patterns */}
          <div>
            <h3 className='text-lg font-semibold text-cyan-400 mb-3'>
              Individual Running Patterns
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase text-center'>Border Pulse</div>
                <div className='flex justify-center items-center h-20'>
                  <BorderPulsePattern />
                </div>
              </div>
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase text-center'>Glow Pulse</div>
                <div className='flex justify-center items-center h-20'>
                  <GlowPulsePattern />
                </div>
              </div>
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase text-center'>
                  Jitter + Motion Blur
                </div>
                <div className='flex justify-center items-center h-20'>
                  <JitterPattern />
                </div>
              </div>
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase text-center'>Light Sweeps</div>
                <div className='flex justify-center items-center h-20'>
                  <LightSweepPattern />
                </div>
              </div>
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase text-center'>Shape Morph</div>
                <div className='flex justify-center items-center h-20'>
                  <ShapeMorphPattern />
                </div>
              </div>
            </div>
          </div>

          {/* Other State Patterns */}
          <div>
            <h3 className='text-lg font-semibold text-yellow-400 mb-3'>Other State Patterns</h3>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase text-center'>
                  Completion Check
                </div>
                <div className='flex justify-center items-center h-20'>
                  <CompletionCheckPattern />
                </div>
              </div>
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase text-center'>Failure Shake</div>
                <div className='flex justify-center items-center h-20'>
                  <FailureShakePattern />
                </div>
              </div>
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase text-center'>Death Glitch</div>
                <div className='flex justify-center items-center h-20'>
                  <DeathGlitchPattern />
                </div>
              </div>
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase text-center'>Flash Effect</div>
                <div className='flex justify-center items-center h-20'>
                  <FlashPattern />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EffectNode Components */}
        <section className='space-y-4 border border-neutral-700 rounded-lg p-6 bg-neutral-800/50'>
          <h2 className='text-xl font-semibold text-blue-400'>EffectNode Variations</h2>

          <div className='grid md:grid-cols-2 gap-6'>
            {/* Basic EffectNode */}
            <div className='space-y-3 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
              <div className='text-xs text-neutral-500 uppercase'>Basic EffectNode</div>
              <div className='flex flex-col items-center gap-4'>
                <EffectNode effect={simpleEffect} />
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={handleRunSimple}
                    className='px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm'
                  >
                    Run
                  </button>
                  <button
                    type='button'
                    onClick={() => simpleEffect.reset()}
                    className='px-3 py-1 bg-neutral-600 hover:bg-neutral-700 rounded text-sm'
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* EffectNode with customLabel */}
            <div className='space-y-3 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
              <div className='text-xs text-neutral-500 uppercase'>EffectNode with customLabel</div>
              <div className='flex flex-col items-center gap-4'>
                <EffectNode
                  effect={customLabelEffect}
                  customLabel='My Custom Label'
                />
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={handleRunCustom}
                    className='px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm'
                  >
                    Run
                  </button>
                  <button
                    type='button'
                    onClick={() => customLabelEffect.reset()}
                    className='px-3 py-1 bg-neutral-600 hover:bg-neutral-700 rounded text-sm'
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Running EffectNode */}
            <div className='space-y-3 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
              <div className='text-xs text-neutral-500 uppercase'>Running EffectNode (long)</div>
              <div className='flex flex-col items-center gap-4'>
                <EffectNode effect={runningEffect} />
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={handleRunLongRunning}
                    className='px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm'
                  >
                    Run (10s)
                  </button>
                  <button
                    type='button'
                    onClick={() => runningEffect.reset()}
                    className='px-3 py-1 bg-neutral-600 hover:bg-neutral-700 rounded text-sm'
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Failed EffectNode */}
            <div className='space-y-3 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
              <div className='text-xs text-neutral-500 uppercase'>Failed EffectNode</div>
              <div className='flex flex-col items-center gap-4'>
                <EffectNode effect={failedEffect} />
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={handleRunFailed}
                    className='px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm'
                  >
                    Run (will fail)
                  </button>
                  <button
                    type='button'
                    onClick={() => failedEffect.reset()}
                    className='px-3 py-1 bg-neutral-600 hover:bg-neutral-700 rounded text-sm'
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stream Pull Prototype */}
        <section className='space-y-4 border border-neutral-700 rounded-lg p-6 bg-neutral-800/50'>
          <h2 className='text-xl font-semibold text-blue-400'>Stream Pull Prototype</h2>
          <p className='text-neutral-400 text-sm'>
            Manual pull-based stream - click button to consume each chunk
          </p>
          <StreamPullPrototype />
        </section>
      </div>
    </div>
  );
}

function StreamPullPrototype() {
  const [queue, setQueue] = useState([1, 2, 3, 4, 5]);
  const [consumed, setConsumed] = useState<number[]>([]);
  const [pulling, setPulling] = useState(false);

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
    setQueue([1, 2, 3, 4, 5]);
    setConsumed([]);
    setPulling(false);
  };

  const isExhausted = queue.length === 0;

  return (
    <div className='space-y-6'>
      {/* Visual Layout */}
      <div className='flex items-start justify-between gap-8 p-6 relative'>
        <ChunkStack
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

function ChunkStack({ items, pulling }: { items: number[]; pulling: boolean }) {
  return (
    <div className='space-y-2 flex-1'>
      <div className='text-sm text-neutral-400 font-mono'>Source Queue</div>
      <div className='flex flex-col gap-3 min-h-[280px]'>
        {items.length > 0 ? (
          items.map((num, idx) => {
            const isBottom = idx === items.length - 1;
            return (
              <ChunkBadgeItem
                key={`queue-${num}`}
                num={num}
                isBottom={isBottom}
                pulling={pulling && isBottom}
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
  pulling,
}: { num: number; isBottom: boolean; pulling: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isBottom ? 1 : 0.5,
        scale: 1,
        x: pulling ? 20 : 0,
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
