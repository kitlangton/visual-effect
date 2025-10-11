# Visual Effect - Codebase Documentation

## Overview

Visual Effect is an interactive visualization tool for the Effect library that demonstrates how Effect operations execute over time. Built with Next.js 15 and React 19, it provides animated visual representations of Effect constructors and combinators with synchronized sound effects, making it easier to understand their behavior.

## Core Concepts

### 1. VisualEffect

The `VisualEffect` class is the heart of the visualization system. It wraps Effect operations and tracks their execution state for visualization purposes.

```typescript
// Creating a visual effect
const myEffect = visualEffect("taskName", Effect.succeed(42));
```

Key features:
- **State tracking**: idle → running → completed/failed/interrupted
- **Observable pattern**: React components can subscribe to state changes
- **Effect caching**: Prevents re-execution of already completed effects
- **Animation flags**: `justStarted` and `justCompleted` for transition animations
- **Sound triggers**: Automatically plays sounds on state transitions

### 2. EffectNode Component

The `EffectNode` component renders individual effects as animated circles with:
- Different colors for different states (idle, running, completed, failed)
- Pulsing animations during execution
- Result display using the renderer system
- Responsive sizing (smaller on mobile via CSS transforms)
- Enhanced accessibility with keyboard navigation support

### 3. Renderer System

Results are displayed using a flexible renderer pattern:

```typescript
class MyResult implements RenderableResult {
  constructor(public value: any) {}
  
  render() {
    return <div>{this.value}</div>;
  }
}
```

Built-in renderers:
- `NumberResult` - Simple number display
- `StringResult` - Simple string display
- `TemperatureResult` - Temperature with °F suffix
- `ObjectResult` - JSON stringified objects
- `ArrayResult` - Array display with proper formatting
- `EmojiResult` - Emoji-based results with enhanced visual appeal

### 4. Effect Examples

Each example follows a consistent pattern:

```typescript
export function EffectExampleName() {
  // 1. Create individual effects with memoization
  const effect1 = useMemo(() => visualEffect("name", effect), []);
  
  // 2. Create composed effect if needed
  const resultEffect = useMemo(() => {
    const composed = Effect.all([effect1.effect, effect2.effect]);
    return new VisualEffect("result", composed, [effect1, effect2]);
  }, [effect1, effect2]);
  
  // 3. Define code snippet and highlight mappings
  const codeSnippet = `...`;
  const effectHighlightMap = { ... };
  
  // 4. Return EffectExample component
  return <EffectExample ... />;
}
```

## Key Patterns

### 1. Jittered Delays

All examples use realistic, non-deterministic delays to simulate real-world conditions:

```typescript
export function getWeather(location?: string) {
  return Effect.gen(function* () {
    const delay = getDelay(500, 900); // Random 500-900ms
    yield* Effect.sleep(delay);
    return new TemperatureResult(...);
  });
}
```

### 2. Responsive Design

- Mobile-first approach with Tailwind breakpoints
- Task nodes scale down on mobile (75% size)
- Flexible layouts that wrap on small screens
- Responsive typography and spacing

### 3. State Management

- Each `VisualEffect` manages its own state
- React components subscribe via `useVisualEffect` hook
- Keyboard navigation state managed via `KeyboardNavigationContext`
- No global state management for effect execution
- Effects persist across component re-renders

### 4. Animation System

- Uses Motion (Framer Motion successor) for smooth transitions
- Spring animations for natural movement with configurable physics
- Different animations for different state transitions
- Hardware-accelerated transforms
- Coordinated scroll animations for keyboard navigation

### 5. Sound System

The application includes a synthesized sound system using Tone.js:

- **Sound Design**:
  - Success: Triangle wave synth with warm tone in higher octave
  - Running: Soft sine wave with quick envelope
  - Failure: Deep bass using sawtooth wave (2 octaves below base)
  - Interrupted: Sharp square wave with immediate cutoff
- **Musical Scale**: Uses C major pentatonic scale for harmonic coherence
- **Audio Effects**: Reverb with 2.5s decay for spacious sound
- **User Controls**: Mute toggle in header with animated slash icon
- **Integration**: Sounds trigger automatically in `VisualEffect.setState()`

## File Structure

```
app/                         # Next.js App Router
├── layout.tsx              # Root layout with metadata
├── page.tsx                # Home page
├── [exampleId]/
│   └── page.tsx            # Individual example pages
└── ClientAppContent.tsx    # Client-side app content

src/
├── components/
│   ├── content/            # Content components
│   │   ├── CodeBlock.tsx   # Syntax-highlighted code
│   │   ├── HeaderView.tsx  # Example headers
│   │   ├── InfoCallout.tsx # Info callouts
│   │   └── Timer.tsx       # Timing displays
│   ├── display/            # Display components
│   │   ├── EffectExample.tsx # Main example wrapper
│   │   └── RefDisplay.tsx  # Ref visualizations
│   ├── effect/             # Effect visualization
│   │   ├── EffectNode.tsx  # Visual effect nodes
│   │   ├── EffectOverlay.tsx # Interactive overlays
│   │   └── taskUtils.ts    # Effect utilities
│   ├── feedback/           # User feedback
│   │   ├── DeathBubble.tsx # Death animations
│   │   ├── FailureBubble.tsx # Failure feedback
│   │   └── NotificationBubble.tsx # Notifications
│   ├── layout/             # Layout components
│   │   ├── NavigationSidebar.tsx # Side navigation
│   │   └── PageHeader.tsx  # Page headers
│   ├── renderers/          # Result rendering system
│   │   ├── ArrayResult.tsx # Array display
│   │   ├── BasicRenderers.tsx # Basic types
│   │   ├── EmojiResult.tsx # Emoji results
│   │   └── TemperatureResult.tsx # Temperature display
│   ├── scope/              # Scope visualization
│   │   ├── FinalizerCard.tsx # Finalizer display
│   │   └── ScopeStack.tsx  # Scope stack
│   └── ui/                 # UI components
│       ├── QuickOpen.tsx   # Command-K search
│       ├── SegmentedControl.tsx # Control inputs
│       └── VolumeToggle.tsx # Audio controls
├── contexts/
│   └── KeyboardNavigationContext.tsx # Navigation state
├── examples/               # Effect examples
│   ├── helpers.ts          # Shared utilities
│   ├── effect-*.tsx        # Effect examples
│   └── ref-*.tsx          # Ref examples
├── hooks/                  # Custom hooks
│   ├── useOptionKey.ts     # Option key detection
│   └── useVisualScope.ts   # Scope management
├── lib/                    # Library code
│   ├── example-types.ts    # Type definitions
│   └── examples-manifest.ts # Example registry
├── sounds/
│   └── TaskSounds.ts       # Synthesized sound system
├── VisualEffect.ts         # Core effect visualization
├── VisualRef.ts           # Ref visualization
├── VisualScope.ts         # Scope visualization
└── AppContent.tsx         # Main app component
```

## Design Decisions

### 1. No External State Management
Each task manages its own state internally, avoiding complexity and making examples self-contained.

### 2. Effect-First Design
The visualization follows Effect's execution model closely - tasks only run when their effect is executed.

### 3. Realistic Timing
All examples use jittered delays to demonstrate non-deterministic behavior, especially important for race conditions.

### 4. Mobile-Responsive
The entire UI adapts to mobile screens without compromising the desktop experience.

### 5. Type Safety
Strict TypeScript configuration catches errors at compile time, including:
- `isolatedModules` for Next.js compatibility
- `noUncheckedIndexedAccess` for array safety
- `exactOptionalPropertyTypes` for precise optional handling
- Effect-specific TypeScript plugin for enhanced type checking

### 6. Audio Experience
Sounds are designed to enhance understanding without being intrusive:
- Single tones instead of complex melodies
- Musical coherence through pentatonic scale
- Automatic sound on state transitions
- User-friendly mute control
- No volume slider - respects system volume

## Common Operations

### Adding a New Effect Example

1. Create a new file in `src/examples/`
2. Use the `getWeather` helper for consistent behavior
3. Follow the example pattern (memoized effects, code snippet, highlight map)
4. Add to the examples manifest in `src/lib/examples-manifest.ts`
5. Generate OG images with `npm run generate-og-images`

### Creating Custom Renderers

1. Implement the `RenderableResult` interface in `src/components/renderers/`
2. Add a `render()` method returning JSX
3. Export from the renderers index file
4. Use in your effect: `Effect.map(value => new MyRenderer(value))`

### Modifying Animations

Look in `EffectNode.tsx` and `motionConfig.ts` for animation configurations:
- Spring settings in `defaultSpring` configuration
- Color transitions in state change logic
- Timing constants in individual components
- Animation tokens in `animationTokens.ts`

## Best Practices

1. **Always memoize effects** - Prevents recreation on every render
2. **Use built-in helpers** - `getWeather()` for consistency
3. **Keep effects pure** - Side effects only for visualization
4. **Test on mobile** - Ensure responsive behavior works
5. **Follow the pattern** - Consistency makes the codebase maintainable
6. **Use proper accessibility** - Keyboard navigation and ARIA labels
7. **Optimize bundle size** - Lazy load examples and use code splitting

## Copy Style Guide

### Text and Descriptions

**Example Descriptions:**
- Use imperative mood (e.g., "Create", "Run", "Compose")
- No ending punctuation (periods, exclamation marks)
- Start with action verbs for consistency
- Keep descriptions concise but informative

**Good Examples:**
- "Run multiple effects concurrently and compose their results"
- "Interrupt a running effect after a specified duration"
- "Accumulate validation errors instead of failing fast"

**Avoid:**
- Present tense ("Creates", "Runs", "Composes")
- Ending punctuation ("Create a new task.")
- Passive voice ("A task is created")

**UI Text:**
- Use proper articles (a, an, the) in prose
- Maintain consistent tone throughout the application
- Keep instructions clear and action-oriented
- Use sentence case for buttons and labels

**Error Messages:**
- Start with the action or context
- Be specific about what went wrong
- Provide actionable next steps when possible

**Code Comments:**
- Use present tense for describing what code does
- Keep comments concise and focused on the "why"
- Avoid obvious comments that just restate the code

## Architecture Decisions

### 1. Next.js App Router
Migrated from Vite to Next.js 15 for:
- Better SEO with server-side rendering
- Individual pages for each example
- Automatic code splitting and optimization
- Built-in image optimization

### 2. Component Architecture
Organized components by domain:
- `content/` - Content display components
- `display/` - Main display logic
- `effect/` - Effect visualization specifics
- `feedback/` - User feedback components
- `layout/` - Layout and navigation
- `renderers/` - Result rendering system
- `scope/` - Scope and finalizer visualization
- `ui/` - Reusable UI components

### 3. New Visualization Types
Expanded beyond basic effects to include:
- **Ref visualization** with `VisualRef` class
- **Scope visualization** with finalizer tracking
- **Enhanced keyboard navigation** with focus management
- **Lazy loading** for better performance

### 4. Enhanced Developer Experience
- Biome for linting and formatting (replaced ESLint/Prettier)
- TypeScript strict mode with Effect language service
- Automated OG image generation for social sharing
- Comprehensive example manifest system