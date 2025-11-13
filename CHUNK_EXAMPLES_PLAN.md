# Chunk Examples Plan

Following the Effect.succeed → Effect.all progression pattern, we should demonstrate Chunk basics before Stream examples.

## Proposed Chunk Examples (in order)

### 1. Chunk.make - Create a chunk
Simple construction from values
```ts
const chunk = Chunk.make(1, 2, 3)
```

### 2. Chunk.append - Add element
```ts
const chunk = Chunk.make(1, 2, 3)
const result = Chunk.append(chunk, 4)
```

### 3. Chunk.concat - Combine chunks
```ts
const chunk1 = Chunk.make(1, 2)
const chunk2 = Chunk.make(3, 4)
const result = Chunk.concat(chunk1, chunk2)
```

### 4. Chunk.map - Transform elements
```ts
const chunk = Chunk.make(1, 2, 3)
const result = Chunk.map(chunk, x => x * 2)
```

### 5. Chunk.filter - Select elements
```ts
const chunk = Chunk.make(1, 2, 3, 4, 5)
const result = Chunk.filter(chunk, x => x % 2 === 0)
```

### 6. Chunk.take/drop - Slice operations
```ts
const chunk = Chunk.make(1, 2, 3, 4, 5)
const taken = Chunk.take(chunk, 3)
const dropped = Chunk.drop(chunk, 2)
```

This mirrors the Effect progression:
- Effect.succeed (simple value) → Chunk.make (simple collection)
- Effect.map → Chunk.map
- Effect.filter → Chunk.filter
- etc.

Then after Chunks are understood, we introduce Streams of Chunks.
