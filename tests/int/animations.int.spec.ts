import { describe, expect, it } from 'vitest'

import { durations, easings } from '@/animations/motion'

describe('animation tokens', () => {
  it('exposes shared durations and easings', () => {
    expect(durations.base).toBeGreaterThan(0)
    expect(easings.out).toHaveLength(4)
  })
})
