import { beforeEach, describe, expect, it } from 'vitest'

import { checkRateLimit, resetRateLimit } from '@/actions/rateLimit'

describe('rate limit (WEB-37)', () => {
  beforeEach(() => {
    resetRateLimit()
  })

  it('allows up to the limit within the window', () => {
    const now = 1_000_000

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(checkRateLimit('ip', 5, 60_000, now + attempt)).toBe(true)
    }

    expect(checkRateLimit('ip', 5, 60_000, now + 10)).toBe(false)
  })

  it('forgets attempts outside the window', () => {
    const now = 1_000_000

    for (let attempt = 0; attempt < 5; attempt += 1) {
      checkRateLimit('ip', 5, 60_000, now + attempt)
    }

    expect(checkRateLimit('ip', 5, 60_000, now + 61_000)).toBe(true)
  })

  it('tracks keys independently', () => {
    const now = 1_000_000

    for (let attempt = 0; attempt < 5; attempt += 1) {
      checkRateLimit('a', 5, 60_000, now)
    }

    expect(checkRateLimit('b', 5, 60_000, now)).toBe(true)
    expect(checkRateLimit('a', 5, 60_000, now)).toBe(false)
  })
})
