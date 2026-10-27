import { NextRequest } from 'next/server'

import { LEGACY_LOCALE_COOKIE, LANGUAGE_COOKIE, REGION_COOKIE } from '@/regions'
import { middleware } from '@/middleware'

import { describe, expect, it } from 'vitest'

// @vitest-environment node

type RequestOptions = {
  region?: string
  language?: string
  legacyLocale?: string
  acceptLanguage?: string
}

const requestAt = (pathname: string, options: RequestOptions = {}) => {
  const req = new NextRequest(`http://localhost:3000${pathname}`)

  if (options.region) {
    req.cookies.set(REGION_COOKIE, options.region)
  }

  if (options.language) {
    req.cookies.set(LANGUAGE_COOKIE, options.language)
  }

  if (options.legacyLocale) {
    req.cookies.set(LEGACY_LOCALE_COOKIE, options.legacyLocale)
  }

  if (options.acceptLanguage) {
    req.headers.set('accept-language', options.acceptLanguage)
  }

  return middleware(req)
}

describe('language-first middleware', () => {
  it('302s the root to the default page for anonymous visitors', () => {
    const res = requestAt('/')

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('http://localhost:3000/es/int')
    expect(res.headers.get('cache-control')).toBe('private, no-store')
  })

  it('keeps the language preference but ignores a previously selected region', () => {
    const res = requestAt('/', { region: 've', language: 'en' })

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('http://localhost:3000/en/int')
  })

  it('ignores the legacy region cookie', () => {
    const res = requestAt('/', { legacyLocale: 'us' })

    expect(res.headers.get('location')).toBe('http://localhost:3000/es/int')
  })

  it('prefers the language cookie over Accept-Language', () => {
    const res = requestAt('/', { language: 'es', acceptLanguage: 'en-US,en;q=0.9' })

    expect(res.headers.get('location')).toBe('http://localhost:3000/es/int')
  })

  it('falls back to Accept-Language when there is no cookie', () => {
    const res = requestAt('/', { acceptLanguage: 'en-US,en;q=0.9,es;q=0.5' })

    expect(res.headers.get('location')).toBe('http://localhost:3000/en/int')
  })

  it('ignores invalid cookie values', () => {
    const res = requestAt('/', { region: 'xx', language: 'fr' })

    expect(res.headers.get('location')).toBe('http://localhost:3000/es/int')
  })

  it('negotiates language by quality and ignores invalid cookies and excluded languages', () => {
    const res = requestAt('/', { language: 'fr', acceptLanguage: 'es;q=0,en;q=0.8' })
    expect(res.headers.get('location')).toBe('http://localhost:3000/en/int')
    expect(requestAt('/', { acceptLanguage: 'es;q=0.2,en;q=0.9' }).headers.get('location')).toBe(
      'http://localhost:3000/en/int',
    )
  })

  it('301s legacy region URLs to the international page in their default language', () => {
    expect(requestAt('/ve').status).toBe(301)
    expect(requestAt('/ve').headers.get('location')).toBe('http://localhost:3000/es/int')
    expect(requestAt('/us').headers.get('location')).toBe('http://localhost:3000/en/int')
    expect(requestAt('/co').headers.get('location')).toBe('http://localhost:3000/es/int')
  })

  it('301s a bare language to the default region', () => {
    const res = requestAt('/es')

    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('http://localhost:3000/es/int')
  })

  it('keeps the two international page paths as-is', () => {
    expect(requestAt('/es/int').headers.get('x-middleware-next')).toBe('1')
    expect(requestAt('/en/int').headers.get('x-middleware-next')).toBe('1')
  })

  it.each(['es', 'en'])(
    'redirects old %s country pages while preserving query parameters',
    (language) => {
      for (const region of ['ve', 'us', 'co']) {
        const response = requestAt(`/${language}/${region}?campaign=legacy`)
        expect(response.status).toBe(301)
        expect(response.headers.get('location')).toBe(
          `http://localhost:3000/${language}/int?campaign=legacy`,
        )
      }
    },
  )

  it('leaves deeper paths to the app’s 404 handling', () => {
    expect(requestAt('/es/us/missing').headers.get('x-middleware-next')).toBe('1')
  })

  it('keeps admin, api, media and preview paths as-is', () => {
    for (const path of ['/admin', '/api/users', '/media/medval-hero.png', '/preview']) {
      expect(requestAt(path).headers.get('x-middleware-next')).toBe('1')
    }
  })
})
