'use client';

import { Chunk, Effect, Stream } from 'effect';
import { useMemo } from 'react';
import { EffectExample } from '@/components/display';
import { ChunkResult, NumberResult } from '@/components/renderers';
import { useVisualEffects } from '@/hooks/useVisualEffects';
import type { ExampleComponentProps } from '@/lib/example-types';
import { VisualEffect } from '@/VisualEffect';
import { getDelay } from './helpers';

export function StreamRangeExample({ exampleId, index, metadata }: ExampleComponentProps) {
  // Individual stream elements being emitted sequentially
  const { emit1, emit2, emit3, emit4, emit5 } = useVisualEffects({
    emit1: () => Effect.sleep(getDelay(200, 400)).pipe(Effect.as(new NumberResult(1))),
    emit2: () => Effect.sleep(getDelay(200, 400)).pipe(Effect.as(new NumberResult(2))),
    emit3: () => Effect.sleep(getDelay(200, 400)).pipe(Effect.as(new NumberResult(3))),
    emit4: () => Effect.sleep(getDelay(200, 400)).pipe(Effect.as(new NumberResult(4))),
    emit5: () => Effect.sleep(getDelay(200, 400)).pipe(Effect.as(new NumberResult(5))),
  });

  // The final collected result - waits for all emissions to complete
  const collector = useMemo(() => {
    const collectorEffect = Effect.all([
      emit1.effect,
      emit2.effect,
      emit3.effect,
      emit4.effect,
      emit5.effect,
    ]).pipe(
      Effect.map((results) => {
        // Extract raw values from NumberResult objects and convert to Chunk
        const numbers = results.map((r) => r.value);
        return new ChunkResult(Chunk.fromIterable(numbers));
      }),
    );

    return new VisualEffect('result', collectorEffect);
  }, [emit1, emit2, emit3, emit4, emit5]);

  const codeSnippet = `const stream = Stream.range(1, 6)

const result = Stream.runCollect(stream)
// Chunk(1, 2, 3, 4, 5)`;

  const taskHighlightMap = useMemo(
    () => ({
      emit1: { text: 'Stream.range(1, 6)' },
      emit2: { text: 'Stream.range(1, 6)' },
      emit3: { text: 'Stream.range(1, 6)' },
      emit4: { text: 'Stream.range(1, 6)' },
      emit5: { text: 'Stream.range(1, 6)' },
      result: { text: 'Stream.runCollect(stream)' },
    }),
    [],
  );

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={useMemo(
        () => [emit1, emit2, emit3, emit4, emit5],
        [emit1, emit2, emit3, emit4, emit5],
      )}
      resultEffect={collector}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  );
}

export default StreamRangeExample;
