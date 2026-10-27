import { describe, expect, it } from 'vitest'

import { durations, easings } from '@/animations/motion'

describe('smooth scroll prerequisites (WEB-48)', () => {
  it('ships shared easing and duration tokens used by the scroll rig', () => {
    expect(durations.base).toBeGreaterThan(0)
    expect(easings.out).toHaveLength(4)
  })

  it('exposes the lenis dependency', async () => {
    const lenis = await import('lenis')

    expect(lenis.default).toBeDefined()
  })
})
