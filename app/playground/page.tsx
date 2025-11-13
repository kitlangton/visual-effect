'use client';

import { Chunk, Effect } from 'effect';
import { useState } from 'react';
import { EffectNode } from '../../src/components/effect';
import { StreamPullPrototype } from '../../src/components/playground/StreamPullPrototype';
import { StreamPullPrototypeV2 } from '../../src/components/playground/StreamPullPrototypeV2';
import { StreamPushPullPrototype } from '../../src/components/playground/StreamPushPullPrototype';
import {
  BorderPulsePattern,
  CardFaceBack,
  CardFaceFront,
  CardFlip,
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
  StackedCard,
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

  // Card component states
  const [cardFlipped, setCardFlipped] = useState(false);
  const [card1Flipped, setCard1Flipped] = useState(false);
  const [card2Flipped, setCard2Flipped] = useState(false);
  const [card3Flipped, setCard3Flipped] = useState(false);
  const [fullStackFlipped, setFullStackFlipped] = useState([false, false, false, false, false]);

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

        {/* Card Atomic Components */}
        <section className='space-y-4 border border-neutral-700 rounded-lg p-6 bg-neutral-800/50'>
          <h2 className='text-xl font-semibold text-blue-400'>Card Atomic Components</h2>
          <p className='text-neutral-400 text-sm'>
            Playing card-style chunk cards with flip animations and stacking
          </p>

          {/* Individual Card Faces */}
          <div>
            <h3 className='text-lg font-semibold text-green-400 mb-3'>Individual Card Faces</h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase text-center'>
                  CardFaceFront (42)
                </div>
                <div className='flex justify-center items-center h-24'>
                  <CardFaceFront value={42} />
                </div>
              </div>
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase text-center'>
                  CardFaceFront (7)
                </div>
                <div className='flex justify-center items-center h-24'>
                  <CardFaceFront value={7} />
                </div>
              </div>
              <div className='space-y-2 border border-neutral-600 rounded p-4 bg-neutral-900/50'>
                <div className='text-xs text-neutral-500 uppercase text-center'>
                  CardFaceBack (Locked)
                </div>
                <div className='flex justify-center items-center h-24'>
                  <CardFaceBack />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Card Flip */}
          <div>
            <h3 className='text-lg font-semibold text-cyan-400 mb-3'>Interactive Card Flip</h3>
            <div className='space-y-4'>
              <div className='flex justify-center items-center border border-neutral-600 rounded p-8 bg-neutral-900/50'>
                <CardFlip
                  isFlipped={cardFlipped}
                  frontFace={<CardFaceFront value={99} />}
                  backFace={<CardFaceBack />}
                />
              </div>
              <div className='flex gap-2 justify-center'>
                <button
                  type='button'
                  onClick={() => setCardFlipped(!cardFlipped)}
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded'
                >
                  {cardFlipped ? 'Flip to Back' : 'Flip to Front'}
                </button>
              </div>
            </div>
          </div>

          {/* Mini Stack Demo */}
          <div>
            <h3 className='text-lg font-semibold text-purple-400 mb-3'>StackedCard (3 cards)</h3>
            <div className='space-y-4'>
              <div
                className='flex justify-center items-start border border-neutral-600 rounded p-8 bg-neutral-900/50'
                style={{ minHeight: '200px' }}
              >
                <div
                  className='relative'
                  style={{ width: '64px', height: '120px' }}
                >
                  <StackedCard
                    value={10}
                    stackIndex={2}
                    totalInStack={3}
                    isFlipped={card3Flipped}
                  />
                  <StackedCard
                    value={20}
                    stackIndex={1}
                    totalInStack={3}
                    isFlipped={card2Flipped}
                  />
                  <StackedCard
                    value={30}
                    stackIndex={0}
                    totalInStack={3}
                    isFlipped={card1Flipped}
                  />
                </div>
              </div>
              <div className='flex gap-2 justify-center flex-wrap'>
                <button
                  type='button'
                  onClick={() => setCard1Flipped(!card1Flipped)}
                  className='px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm'
                >
                  Flip Bottom (30)
                </button>
                <button
                  type='button'
                  onClick={() => setCard2Flipped(!card2Flipped)}
                  className='px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm'
                >
                  Flip Middle (20)
                </button>
                <button
                  type='button'
                  onClick={() => setCard3Flipped(!card3Flipped)}
                  className='px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-sm'
                >
                  Flip Top (10)
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setCard1Flipped(false);
                    setCard2Flipped(false);
                    setCard3Flipped(false);
                  }}
                  className='px-3 py-1 bg-neutral-600 hover:bg-neutral-700 rounded text-sm'
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>

          {/* Full Card Stack */}
          <div>
            <h3 className='text-lg font-semibold text-yellow-400 mb-3'>
              Full Card Stack (5 cards)
            </h3>
            <div className='space-y-4'>
              <div
                className='flex justify-center items-start border border-neutral-600 rounded p-8 bg-neutral-900/50'
                style={{ minHeight: '240px' }}
              >
                <div
                  className='relative'
                  style={{ width: '64px', height: '160px' }}
                >
                  {[5, 4, 3, 2, 1].map((value, index) => (
                    <StackedCard
                      key={value}
                      value={value}
                      stackIndex={4 - index}
                      totalInStack={5}
                      isFlipped={fullStackFlipped[4 - index] ?? false}
                    />
                  ))}
                </div>
              </div>
              <div className='flex gap-2 justify-center flex-wrap'>
                <button
                  type='button'
                  onClick={() => {
                    const newFlipped = [...fullStackFlipped];
                    newFlipped[0] = !newFlipped[0];
                    setFullStackFlipped(newFlipped);
                  }}
                  className='px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm'
                >
                  Flip Bottom
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setFullStackFlipped(fullStackFlipped.map((_, i) => i === 0));
                  }}
                  className='px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm'
                >
                  Flip All Sequential
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setFullStackFlipped([false, false, false, false, false]);
                  }}
                  className='px-3 py-1 bg-neutral-600 hover:bg-neutral-700 rounded text-sm'
                >
                  Reset
                </button>
              </div>
              <div className='text-xs text-neutral-400 text-center'>
                Bottom card (index 0) has pulsing highlight
              </div>
            </div>
          </div>
        </section>

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

        {/* Stream Pull Prototype V2 - With Card Flips */}
        <section className='space-y-4 border border-neutral-700 rounded-lg p-6 bg-neutral-800/50'>
          <h2 className='text-xl font-semibold text-blue-400'>Stream Pull Prototype V2 🃏</h2>
          <p className='text-neutral-400 text-sm'>
            Cards start face-down (mystery), flip to reveal value when pulled
          </p>
          <StreamPullPrototypeV2 />
        </section>

        {/* Stream Pull Prototype (Original) */}
        <section className='space-y-4 border border-neutral-700 rounded-lg p-6 bg-neutral-800/50'>
          <h2 className='text-xl font-semibold text-blue-400'>Stream Pull Prototype (Original)</h2>
          <p className='text-neutral-400 text-sm'>
            Manual pull-based stream - click button to consume each chunk
          </p>
          <StreamPullPrototype />
        </section>

        {/* Stream Push + Pull Prototype */}
        <section className='space-y-4 border border-neutral-700 rounded-lg p-6 bg-neutral-800/50'>
          <h2 className='text-xl font-semibold text-purple-400'>Stream Push + Pull Prototype</h2>
          <p className='text-neutral-400 text-sm'>
            Push new chunks from the cloud, pull from the bottom - simulates async stream sources
          </p>
          <StreamPushPullPrototype />
        </section>
      </div>
    </div>
  );
}
