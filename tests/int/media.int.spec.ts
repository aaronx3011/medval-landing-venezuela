import config from '@/payload.config'

import { describe, expect, it } from 'vitest'

describe('Media collection config', () => {
  it('generates thumbnail, card and wide sizes on upload', async () => {
    const { collections } = await config

    const media = collections.find((collection) => collection.slug === 'media')
    if (!media) {
      throw new Error('Media collection must be registered')
    }

    expect(media.upload?.imageSizes?.map((size) => size.name)).toEqual([
      'thumbnail',
      'card',
      'wide',
    ])
    expect(media.upload?.mimeTypes).toEqual(['image/*'])
  })

  it('requires alt text with Spanish help', async () => {
    const { collections } = await config

    const media = collections.find((collection) => collection.slug === 'media')
    const alt = media?.fields.find((field) => 'name' in field && field.name === 'alt')

    expect(alt?.type).toBe('text')
    if (alt?.type === 'text') {
      expect(alt.required).toBe(true)
      expect(alt.admin?.description).toHaveProperty('es')
    }
  })
})
