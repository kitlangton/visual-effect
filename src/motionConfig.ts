export const defaultSpring = {
  type: "spring" as const,
  // Critical damping occurs when damping \u2248 2 * sqrt(stiffness * mass).
  // With mass = 1, choose stiffness that feels snappy but natural and
  // compute damping accordingly.
  mass: 1,
  stiffness: 200,
  damping: 2 * Math.sqrt(200), // \u2248 28.28
  // No bounce/overshoot for critically damped motion
  bounce: 0,
}

// If you need to tweak the feel, adjust `stiffness` and keep
// damping \u2248 2 * sqrt(stiffness * mass) to maintain critical damping.
