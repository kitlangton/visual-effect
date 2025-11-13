'use client';

import { Chunk } from 'effect';
import { useMemo } from 'react';
import { EffectExample } from '@/components/display';
import { ChunkBadge } from '@/components/renderers';
import type { ExampleComponentProps } from '@/lib/example-types';

export function ChunkMakeExample({ exampleId, index, metadata }: ExampleComponentProps) {
  // Just display the chunk - no effects needed, it's a pure value
  const chunk = useMemo(() => Chunk.make(1, 2, 3, 4, 5), []);

  const codeSnippet = `const chunk = Chunk.make(1, 2, 3, 4, 5)
// Chunk(5) [1, 2, 3, 4, 5]`;

  return (
    <div className='w-full flex flex-col border border-neutral-600 rounded-2xl shadow-2xl bg-neutral-800/50'>
      {/* Header */}
      <div className='p-4 border-b border-neutral-600 rounded-t-2xl bg-neutral-800/70'>
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center'>
            <span className='text-2xl'>✦</span>
          </div>
          <div>
            <h3 className='text-xl font-bold'>{metadata.name}</h3>
            <p className='text-neutral-400 text-sm'>{metadata.description}</p>
          </div>
        </div>
      </div>

      {/* Visual */}
      <div className='px-4 py-8 border-b border-neutral-600'>
        <div className='flex justify-center'>
          <ChunkBadge chunk={chunk} />
        </div>
      </div>

      {/* Code */}
      <div className='p-4'>
        <pre className='text-sm font-mono'>
          <code>
            <span className='text-purple-400'>const</span> <span className='text-white'>chunk</span>{' '}
            <span className='text-neutral-500'>=</span> <span className='text-blue-400'>Chunk</span>
            <span className='text-neutral-500'>.</span>
            <span className='text-green-400'>make</span>
            <span className='text-neutral-500'>(</span>
            <span className='text-yellow-400'>1</span>
            <span className='text-neutral-500'>, </span>
            <span className='text-yellow-400'>2</span>
            <span className='text-neutral-500'>, </span>
            <span className='text-yellow-400'>3</span>
            <span className='text-neutral-500'>, </span>
            <span className='text-yellow-400'>4</span>
            <span className='text-neutral-500'>, </span>
            <span className='text-yellow-400'>5</span>
            <span className='text-neutral-500'>)</span>
            {'\n'}
            <span className='text-neutral-600'>// Chunk(5) [1, 2, 3, 4, 5]</span>
          </code>
        </pre>
      </div>
    </div>
  );
}

export default ChunkMakeExample;
