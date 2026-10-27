import { whatsappUrl } from '@/lib/whatsapp'

import { describe, expect, it } from 'vitest'

describe('WhatsApp URL builder', () => {
  it('builds a wa.me link with the Spanish prefilled message by default', () => {
    expect(whatsappUrl('584120000000')).toBe(
      `https://wa.me/584120000000?text=${encodeURIComponent(
        'Hola Medval Supplies, me gustaría recibir más información.',
      )}`,
    )
  })

  it('uses the English default message for the en language', () => {
    expect(whatsappUrl('584120000000', 'en')).toBe(
      `https://wa.me/584120000000?text=${encodeURIComponent(
        'Hi Medval Supplies, I would like to receive more information.',
      )}`,
    )
  })

  it('falls back to Spanish for unknown languages', () => {
    expect(whatsappUrl('584120000000', 'fr')).toBe(whatsappUrl('584120000000'))
  })

  it('honours a custom message over the language default', () => {
    expect(whatsappUrl('584120000000', 'en', 'Custom')).toBe(
      `https://wa.me/584120000000?text=${encodeURIComponent('Custom')}`,
    )
  })

  it('strips formatting from the number', () => {
    expect(whatsappUrl('+58 412-000-0000')?.startsWith('https://wa.me/584120000000')).toBe(true)
  })

  it('returns null when there is no number', () => {
    expect(whatsappUrl(null)).toBeNull()
    expect(whatsappUrl(undefined)).toBeNull()
  })
})
