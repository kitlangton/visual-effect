'use client';

import { Chunk } from 'effect';
import { motion } from 'motion/react';
import type { RenderableResult } from './RenderableResult';

export class ChunkResult<T> implements RenderableResult {
  constructor(public chunk: Chunk.Chunk<T>) {}

  render() {
    const values = Chunk.toReadonlyArray(this.chunk);
    return (
      <motion.div
        key='chunk'
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          fontSize: 11,
          fontFamily: 'monospace',
        }}
      >
        <div style={{ opacity: 0.6 }}>Chunk({values.length})</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          {values.map((val, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 12,
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
