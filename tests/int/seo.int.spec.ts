import { allPages, defaultRegion, hreflang, pagePath } from '@/regions'
import sitemap from '@/app/sitemap'

import { describe, expect, it } from 'vitest'

describe('SEO setup', () => {
  it('exposes only the Spanish and English international pages', () => {
    const tags = allPages().map(({ language, region }) => hreflang(language, region))

    expect(tags).toEqual(['es', 'en'])
    expect(allPages().every(({ region }) => region === defaultRegion)).toBe(true)
    expect(sitemap().map(({ url }) => new URL(url).pathname)).toEqual(['/es/int', '/en/int'])
  })

  it('uses the bare language tag for the international region', () => {
    expect(hreflang('es', 'int')).toBe('es')
    expect(hreflang('en', 'int')).toBe('en')
  })

  it('canonicals each page under its language and region segments', () => {
    expect(pagePath('en', defaultRegion)).toBe('/en/int')
    expect(pagePath('es', 'int')).toBe('/es/int')
    expect(pagePath('es', defaultRegion)).toBe('/es/int')
  })
})
