// Animation tokens for consistent motion design across components
export const animationTokens = {
  // Spring presets
  springs: {
    // Main spring for general animations
    default: {
      type: "spring" as const,
      stiffness: 180,
      damping: 25,
      mass: 0.8,
    },
    // Bouncy spring for completion animations
    bouncy: {
      type: "spring" as const,
      bounce: 0.3,
      visualDuration: 0.5,
    },
    // Node width animation with custom bounce
    nodeWidth: {
      type: "spring" as const,
      stiffness: 180,
      damping: 25,
      mass: 0.8,
      visualDuration: 0.6,
      bounce: 0.3,
    },
    // Content scale animation for completion
    contentScale: {
      type: "spring" as const,
      bounce: 0.3,
      visualDuration: 0.5,
      stiffness: 260,
      damping: 18,
    },
    // Failure bubble animation
    failureBubble: {
      type: "spring" as const,
      visualDuration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.05,
      bounce: 0.3,
    },
  },

  // Shake animation constants
  shake: {
    // Running state jitter
    running: {
      angleRange: 4,
      angleBase: 0.5,
      offsetRange: 1.5,
      offsetBase: 0.5,
      offsetYRange: 0.6,
      offsetYBase: 0.1,
      durationMin: 0.1,
      durationMax: 0.2,
    },
    // Failure/death shake - more intense
    failure: {
      intensity: 8,
      duration: 0.08,
      count: 6,
      rotationRange: 8,
      returnDuration: 0.3,
    },
    // Failure bubble shake - gentler
    bubble: {
      intensity: 4,
      duration: 0.08,
      count: 4,
      rotationRange: 4,
      yOffset: -5,
      returnDuration: 0.3,
      delay: 100,
    },
  },

  // Animation durations and timing
  timing: {
    // Border pulsing
    borderPulse: {
      duration: 1.5,
      values: [1, 0.3, 1],
    },
    // Glow pulsing
    glowPulse: {
      duration: 0.5,
      values: [1, 5, 1],
    },
    // Flash animation
    flash: {
      duration: 1.0,
      ease: "linear" as const,
    },
    // Smooth exit animations
    exit: {
      duration: 0.3,
      ease: [0.4, 0, 0.6, 1] as const,
    },
    // Glitch effect timing
    glitch: {
      initialCount: 3,
      initialDelayMin: 20,
      initialDelayMax: 70,
      pauseMin: 50,
      pauseMax: 150,
      subtleDelayMin: 300,
      subtleDelayMax: 800,
    },
  },

  // Color values for animations
  colors: {
    // Flash colors
    flash: "rgba(255, 255, 255, 0.8)",

    // Border colors
    border: {
      default: "rgba(255, 255, 255, 0.1)",
      death: "rgba(220, 38, 38, 0.4)",
    },

    // Failure bubble colors
    failureBubble: {
      background: "rgba(239, 68, 68, 0.95)",
      text: "text-red-50",
      shadow: "0 0px 16px rgba(0, 0, 0, 0.5)",
    },

    // Glow effects
    glow: {
      death: "rgba(220, 38, 38, 0.8)",
      running: "rgba(100, 200, 255, 0.2)",
    },
  },

  // Transform and filter values
  effects: {
    // Blur transforms
    blur: {
      velocityRange: [-100, 0, 100] as const,
      blurRange: [1, 0, 1] as const,
    },
    // Death filter effects
    death: {
      contrast: 1.2,
      brightness: 0.8,
      glowMultiplier: 2,
    },
    // Glitch intensity ranges
    glitch: {
      scaleRange: 0.2,
      glowMin: 3,
      glowMax: 7,
      intensePulseMax: 10,
    },
  },

  // Dimensional constants
  dimensions: {
    // Failure bubble
    failureBubble: {
      borderRadius: "8px",
      maxWidth: "200px",
      marginBottom: "8px",
      arrowSize: "6px",
    },
    // Default node dimensions
    nodeDefaults: {
      width: 64,
      height: 64,
      bubbleY: 10,
      bubbleBlur: 10,
      bubbleScale: 0.8,
    } as const,
  },
} as const
