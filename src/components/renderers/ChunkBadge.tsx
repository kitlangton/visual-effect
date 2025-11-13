'use client';

import { Chunk } from 'effect';
import { motion } from 'motion/react';
import type { RenderableResult } from './RenderableResult';

export class ChunkBadge<T> implements RenderableResult {
  constructor(public chunk: Chunk.Chunk<T>) {}

  render() {
    const values = Chunk.toReadonlyArray(this.chunk);
    return (
      <motion.div
        key='chunk-badge'
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontFamily: 'monospace',
            opacity: 0.6,
          }}
        >
          Chunk({values.length})
        </div>
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {values.map((val, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              {String(val)}
            </motion.span>
          ))}
        </div>
      </motion.div>
    );
  }
}
