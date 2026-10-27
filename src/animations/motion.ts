export const durations = {
  instant: 0.15,
  fast: 0.3,
  base: 0.6,
  slow: 1,
  hero: 1.4,
} as const

export const easings = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
  overshoot: [0.34, 1.56, 0.64, 1],
} as const
