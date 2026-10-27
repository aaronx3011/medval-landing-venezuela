import config from '@/payload.config'

import { describe, expect, it } from 'vitest'

describe('Quote Requests collection config', () => {
  it('holds every submission field', async () => {
    const { collections } = await config

    const quoteRequests = collections.find((collection) => collection.slug === 'quote-requests')
    if (!quoteRequests) {
      throw new Error('Quote Requests collection must be registered')
    }

    const fieldNames = quoteRequests.fields.flatMap((field) =>
      'name' in field ? [field.name] : [],
    )

    for (const name of [
      'name',
      'email',
      'phone',
      'region',
      'language',
      'service',
      'message',
      'type',
      'date',
    ]) {
      expect(fieldNames).toContain(name)
    }
  })

  it('is readable by editors but read-only, and creatable by the public', async () => {
    const { collections } = await config

    const quoteRequests = collections.find((collection) => collection.slug === 'quote-requests')
    if (!quoteRequests) {
      throw new Error('Quote Requests collection must be registered')
    }

    expect(quoteRequests.access?.create?.({ req: { user: null } as never })).toBe(true)
    expect(quoteRequests.access?.read?.({ req: { user: null } as never })).toBe(false)
    expect(quoteRequests.access?.read?.({ req: { user: { role: 'editor' } } as never })).toBe(true)
    expect(quoteRequests.access?.update?.({ req: { user: { role: 'editor' } } as never })).toBe(
      false,
    )
    expect(quoteRequests.access?.update?.({ req: { user: { role: 'admin' } } as never })).toBe(true)
  })

  it('offers the four regions from the central region list', async () => {
    const { collections } = await config

    const quoteRequests = collections.find((collection) => collection.slug === 'quote-requests')
    const region = quoteRequests?.fields.find((field) => 'name' in field && field.name === 'region')

    expect(region?.type).toBe('select')
    if (region?.type === 'select') {
      expect(
        region.options.map((option) => (typeof option === 'string' ? option : option.value)),
      ).toEqual(['int', 've', 'us', 'co'])
    }

    const language = quoteRequests?.fields.find(
      (field) => 'name' in field && field.name === 'language',
    )

    expect(language?.type).toBe('select')
    if (language?.type === 'select') {
      expect(
        language.options.map((option) => (typeof option === 'string' ? option : option.value)),
      ).toEqual(['es', 'en'])
    }
  })
})
