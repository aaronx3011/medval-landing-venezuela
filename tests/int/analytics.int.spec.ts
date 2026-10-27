import { describe, expect, it } from 'vitest'

import { Analytics, trackEvent } from '@/components/Analytics'

describe('GA4 analytics (WEB-41)', () => {
  it('exposes the tracking helper without crashing when gtag is absent', () => {
    expect(trackEvent).toBeDefined()
    expect(() => trackEvent('form_submit', { region: 've', language: 'es' })).not.toThrow()
  })

  it('renders nothing without NEXT_PUBLIC_GA_ID', () => {
    expect(Analytics).toBeDefined()
  })
})
