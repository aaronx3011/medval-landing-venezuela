import type { MetadataRoute } from 'next'

import { allPages, defaultRegion, hreflang, pagePath } from '@/regions'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const alternates = () =>
  Object.fromEntries([
    ...allPages().map(({ language, region }) => [
      hreflang(language, region),
      `${baseUrl}${pagePath(language, region)}`,
    ]),
    ['x-default', `${baseUrl}${pagePath('es', defaultRegion)}`],
  ])

export default function sitemap(): MetadataRoute.Sitemap {
  return allPages().flatMap(({ language, region }) => [
    {
      alternates: {
        languages: alternates(),
      },
      lastModified: new Date(),
      url: `${baseUrl}${pagePath(language, region)}`,
    },
    {
      url: `${baseUrl}${pagePath(language, region)}/catalogo`,
      alternates: {
        languages: { es: `${baseUrl}/es/int/catalogo`, en: `${baseUrl}/en/int/catalogo` },
      },
    },
  ])
}
