import { describe, expect, it } from 'vitest'

import { assertSeedAllowed } from '@/seed/assertSeedAllowed'

describe('seed guard', () => {
  it('runs in development', () => {
    expect(() => assertSeedAllowed({ NODE_ENV: 'development' })).not.toThrow()
    expect(() => assertSeedAllowed({})).not.toThrow()
  })

  it('runs on staging-like servers when SEED_ALLOWED is set', () => {
    expect(() => assertSeedAllowed({ NODE_ENV: 'production', SEED_ALLOWED: '1' })).not.toThrow()
  })

  it('refuses to run in production (WEB-49)', () => {
    expect(() => assertSeedAllowed({ NODE_ENV: 'production' })).toThrow(
      'must never run in production',
    )
    expect(() => assertSeedAllowed({ NODE_ENV: 'production', SEED_ALLOWED: '0' })).toThrow(
      'must never run in production',
    )
  })
})
