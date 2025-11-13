# Running Effect Visual Patterns

This document describes the two distinct visual patterns that occur when an EffectNode is in the "running" state.

## Pattern 1: Border Pulse + Glow Pulse

**Location:** `src/components/effect/useEffectMotion.ts:154-166`

**What it does:** Simultaneously animates border opacity and glow intensity in a pulsing pattern.

### Visual Characteristics

- **Border Opacity:** Pulses from 1 → 0.3 → 1
- **Glow Intensity:** Pulses from 1 → 5 → 1
- **Duration:** 
  - Border: 1.5s per cycle
  - Glow: 0.5s per cycle
- **Easing:** `easeInOut` for both
- **Repeat:** Infinite loops
- **Colors:**
  - Border: `rgba(100, 200, 255, 0.8)` (bright blue)
  - Glow: `rgba(100, 200, 255, 0.2)` (softer blue)

### Implementation Details

```typescript
// Border pulse animation
animate(motionValues.borderOpacity, [1, 0.3, 1], {
  duration: 1.5,
  ease: "easeInOut",
  repeat: Infinity,
})

// Glow pulse animation
animate(motionValues.glowIntensity, [1, 5, 1], {
  duration: 0.5,
  ease: "easeInOut",
  repeat: Infinity,
})
```

### Where it renders:

1. **Border:** `EffectOverlay.tsx:48-60` - Inset box-shadow overlay
2. **Glow:** `EffectContainer.tsx:70-83` - Box-shadow on the container

The glow uses `boxShadow: 0 0 ${cappedGlow}px rgba(100, 200, 255, 0.2)` where `cappedGlow` is capped at 8px max.

---

## Pattern 2: Continuous Jitter (Rotation + Position)

**Location:** `src/components/effect/useEffectMotion.ts:168-199`

**What it does:** Randomly jitters the node's rotation and position in an endless loop.

### Visual Characteristics

- **Rotation:** Random angles between ±0.5° to ±4.5°
- **X Offset:** Random between ±0.5px to ±2px
- **Y Offset:** Random between ±0.1px to ±0.7px
- **Duration per jitter:** 0.1s to 0.2s (randomized)
- **Easing:** 
  - Rotation: `circInOut`
  - Position: `easeInOut`
- **Pattern:** Infinite recursive loop via requestAnimationFrame

### Implementation Details

```typescript
// Random values computed each cycle
const angle = (Math.random() * 4 + 0.5) * (Math.random() < 0.5 ? 1 : -1)
const offsetX = (Math.random() * 1.5 + 0.5) * (Math.random() < 0.5 ? -1 : 1)
const offsetY = (Math.random() * 0.6 + 0.1) * (Math.random() < 0.5 ? -1 : 1)
const duration = 0.1 + Math.random() * 0.1 // 0.1 to 0.2 seconds

// All three animate simultaneously
animate(motionValues.rotation, angle, { duration, ease: "circInOut" })
animate(motionValues.shakeX, offsetX, { duration, ease: "easeInOut" })
animate(motionValues.shakeY, offsetY, { duration, ease: "easeInOut" })

// When all three finish, schedule next jitter
Promise.all([rot.finished, x.finished, y.finished]).then(() => {
  rafId = requestAnimationFrame(jitter)
})
```

### Where it renders:

`EffectContainer.tsx:51-53` - Applied as transform values on the main container:
- `rotate: motionValues.rotation`
- `x: motionValues.shakeX`
- `y: motionValues.shakeY`

### Side Effect: Motion Blur

The rotation velocity is tracked and converted to blur:

- **Blur calculation:** `EffectContainer.tsx:61-68`
- Rotation velocity mapped from [-100, 0, 100] → [1px, 0px, 1px] blur
- Capped at 2px maximum
- Applied via CSS filter on the container

---

## Pattern 3: Sweeping Light Overlay

**Location:** `EffectOverlay.tsx:13-43`

**What it does:** Multiple animated light sweeps move horizontally across the node.

### Visual Characteristics

- **Count:** 6 simultaneous sweeps with staggered delays
- **Delays:** 0s, 0.2s, 0.4s, 0.6s, 0.8s, 1.0s
- **Width:** 200% of container (allows off-screen starting position)
- **Animation:** Moves from `-66%` to `50%` horizontally
- **Duration:** 0.8s per sweep
- **Easing:** Custom cubic-bezier `[0.5, 0, 0.1, 1]`
- **Gradient:** Linear gradient with white center spike
  - `transparent 0%` → `transparent 40%` → `rgba(255,255,255,0.1) 45%` → `rgba(255,255,255,0.5) 50%` → `rgba(255,255,255,0.1) 55%` → `transparent 60%` → `transparent 100%`
- **Effects:**
  - `filter: blur(4px)` - Softens the light
  - `mixBlendMode: lighten` - Blends naturally with background
- **Repeat:** Infinite

### Implementation Details

```typescript
{[0, 0.2, 0.4, 0.6, 0.8, 1].map((delay, i) => (
  <motion.div
    key={i}
    style={{
      position: "absolute",
      top: 0, left: 0, bottom: 0,
      width: "200%",
      background: "linear-gradient(90deg, transparent 0%, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.1) 55%, transparent 60%, transparent 100%)",
      filter: "blur(4px)",
      mixBlendMode: "lighten",
    }}
    animate={{ x: ["-66.0%", "50%"] }}
    transition={{
      duration: 0.8,
      delay,
      repeat: Infinity,
      ease: [0.5, 0, 0.1, 1],
    }}
  />
))}
```

### Where it renders:

`EffectOverlay.tsx:62-63` - Rendered when `isRunning === true`, inside the node container after the border overlay.

---

## How the Patterns Work Together

### Timing Relationship

1. **Border Pulse (1.5s cycle)** - Slow, steady breathing
2. **Glow Pulse (0.5s cycle)** - Fast heartbeat, 3x faster than border
3. **Jitter (0.1-0.2s per move)** - Erratic, nervous energy
4. **Light Sweeps (0.8s per sweep, 6 staggered)** - Constant flow of activity

The different speeds create a complex, organic "working" feeling:
- Border provides slow rhythm
- Glow adds urgency
- Jitter gives instability/activity
- Sweeps show progress/motion

### Layering (z-order from back to front)

1. Base container with node background
2. Light sweeps overlay (inside container)
3. Border pulse overlay (inset box-shadow)
4. Glow (outer box-shadow on container)
5. Motion blur (filter on container from jitter)

### Accessibility

All patterns respect `prefers-reduced-motion`:
- Patterns stop completely when reduced motion is preferred
- Motion values reset to neutral (rotation: 0, shake: 0, opacity: 1, glow: 0)

---

## Key Files Reference

| Pattern | Primary Implementation | Rendering |
|---------|----------------------|-----------|
| Border Pulse | `useEffectMotion.ts:155-159` | `EffectOverlay.tsx:48-60` |
| Glow Pulse | `useEffectMotion.ts:162-166` | `EffectContainer.tsx:70-83` |
| Jitter | `useEffectMotion.ts:168-199` | `EffectContainer.tsx:51-53` |
| Light Sweeps | N/A (declarative) | `EffectOverlay.tsx:13-43` |
| Motion Blur | `useEffectMotion.ts:85` (derived) | `EffectContainer.tsx:61-68` |

---

## Additional Running-State Changes

### Shape Changes

**Height reduction:** `useEffectMotion.ts:227-233`
- Height animates from 64px → 25.6px (64 * 0.4)
- Spring animation with 0.3 bounce
- 0.4s duration

**Border radius change:** `useEffectMotion.ts:222-224`
- Border radius changes from 8px → 15px
- Makes the running node more pill-shaped

**Width:** `useEffectMotion.ts:240`
- Set to fixed 64px (not animated)

### Content Changes

**Content opacity:** `useEffectMotion.ts:243`
- Content fades to 0 when running (icon disappears)
- Implemented in `EffectContent.tsx:120` via `opacity: motionValues.contentOpacity`

---

## Animation Constants

All timing/color values are defined in `src/animations.ts`:

```typescript
// Border pulse timing
timing.borderPulse = {
  duration: 1.5,
  values: [1, 0.3, 1],
}

// Glow pulse timing  
timing.glowPulse = {
  duration: 0.5,
  values: [1, 5, 1],
}

// Jitter ranges
shake.running = {
  angleRange: 4,      // rotation variance
  angleBase: 0.5,     // minimum rotation
  offsetRange: 1.5,   // X position variance
  offsetBase: 0.5,    // minimum X offset
  offsetYRange: 0.6,  // Y position variance
  offsetYBase: 0.1,   // minimum Y offset
  durationMin: 0.1,   // fastest jitter
  durationMax: 0.2,   // slowest jitter
}

// Colors
colors.glow.running = "rgba(100, 200, 255, 0.2)"
colors.border.default = "rgba(255, 255, 255, 0.1)"
```

---

## Applying to Stream Emission Nodes

To apply similar patterns to stream emission nodes:

1. **Use the same hook structure:** Create `useStreamEmissionMotion()` based on `useEffectMotion()`
2. **Reuse motion values:** Same set of motion values (rotation, shakeX/Y, glowIntensity, etc.)
3. **Adjust constants:** Create separate config in `animations.ts` for emission-specific values
4. **Consider different colors:** Maybe green/cyan instead of blue to differentiate from effects
5. **Adjust intensity:** Emissions might be subtler (smaller glow, less jitter)
6. **Pattern variation:** Could use faster pulses or different light sweep patterns

The architecture is already set up to support this - just need to:
1. Create emission-specific animation constants
2. Create `useEmissionMotion()` hook
3. Apply to emission node components
