import { NextResponse, type NextRequest } from 'next/server'

import {
  defaultLanguage,
  defaultLanguageByRegion,
  defaultRegion,
  isLanguageCode,
  isRegionCode,
  LANGUAGE_COOKIE,
  pagePath,
  parseAcceptLanguage,
  type LanguageCode,
} from './regions'

const PUBLIC_FILE = /\.(.*)$/

const isInternalPath = (pathname: string) =>
  pathname.startsWith('/admin') ||
  pathname.startsWith('/api') ||
  pathname.startsWith('/_next') ||
  pathname.startsWith('/media') ||
  pathname.startsWith('/preview') ||
  pathname === '/favicon.ico' ||
  PUBLIC_FILE.test(pathname)

const rootLanguage = (req: NextRequest): LanguageCode => {
  const cookieLanguage = req.cookies.get(LANGUAGE_COOKIE)?.value
  if (isLanguageCode(cookieLanguage)) {
    return cookieLanguage
  }

  return parseAcceptLanguage(req.headers.get('accept-language')) ?? defaultLanguage
}

export const middleware = (req: NextRequest) => {
  const { pathname } = req.nextUrl

  if (isInternalPath(pathname)) {
    // Firefox omits Sec-Fetch-Site on RSC navigations, and Payload's JWT cookie
    // extraction rejects requests without it when a CSRF allowlist is configured.
    // Safe (GET/HEAD) requests to our own app get it restored; mutations always
    // carry Origin and keep the full CSRF check.
    if (
      (pathname.startsWith('/admin') || pathname.startsWith('/api')) &&
      !req.headers.get('sec-fetch-site') &&
      (req.method === 'GET' || req.method === 'HEAD')
    ) {
      const headers = new Headers(req.headers)
      headers.set('sec-fetch-site', 'same-origin')

      return NextResponse.next({ request: { headers } })
    }

    return NextResponse.next()
  }

  const segments = pathname.split('/').filter(Boolean)
  const [first, second] = segments
  const url = req.nextUrl.clone()

  // Public pages share the language/region prefix; subpages validate their own route.
  if (first && isLanguageCode(first) && second && isRegionCode(second)) {
    if (segments.length === 2 && second !== defaultRegion) {
      url.pathname = pagePath(first, defaultRegion)
      return NextResponse.redirect(url, 301)
    }
    return NextResponse.next()
  }

  // `/{language}` without a region → the default region
  if (segments.length === 1 && first && isLanguageCode(first)) {
    url.pathname = pagePath(first, defaultRegion)

    return NextResponse.redirect(url, 301)
  }

  // Legacy region-only URLs keep their default language, using international content.
  if (segments.length === 1 && first && isRegionCode(first)) {
    url.pathname = pagePath(defaultLanguageByRegion[first], defaultRegion)

    return NextResponse.redirect(url, 301)
  }

  // Root: personalized, so it must never be cached as canonical
  if (segments.length === 0) {
    url.pathname = pagePath(rootLanguage(req), defaultRegion)

    const response = NextResponse.redirect(url, 302)
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('Vary', 'Cookie, Accept-Language')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
