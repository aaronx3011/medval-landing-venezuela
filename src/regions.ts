export type RegionCode = 'int' | 've' | 'us' | 'co'

export type LanguageCode = 'es' | 'en'

export type RegionDefinition = {
  code: RegionCode
  /** ISO 3166-1 alpha-2 country code, or null for the international catch-all */
  country: string | null
  /** Display name per language, for switchers and form selects */
  label: Record<LanguageCode, string>
}

/**
 * Single source of truth for site regions.
 * `int` is the default region and the fallback for empty region fields.
 */
export const regions: RegionDefinition[] = [
  { code: 'int', country: null, label: { es: 'LATAM', en: 'LATAM' } },
  { code: 've', country: 'VE', label: { es: 'Venezuela', en: 'Venezuela' } },
  { code: 'us', country: 'US', label: { es: 'Estados Unidos', en: 'United States' } },
  { code: 'co', country: 'CO', label: { es: 'Colombia', en: 'Colombia' } },
]

export const languages: LanguageCode[] = ['es', 'en']

export const defaultRegion: RegionCode = 'int'
export const defaultLanguage: LanguageCode = 'es'

/** Language each region's page defaults to when the visitor has no preference */
export const defaultLanguageByRegion: Record<RegionCode, LanguageCode> = {
  int: 'es',
  ve: 'es',
  us: 'en',
  co: 'es',
}

export const REGION_COOKIE = 'medval-region'
export const LANGUAGE_COOKIE = 'medval-language'
/** Pre-2026 cookie; read for one release so returning visitors keep their region */
export const LEGACY_LOCALE_COOKIE = 'medval-locale'

export const isRegionCode = (value: unknown): value is RegionCode =>
  typeof value === 'string' && regions.some((region) => region.code === value)

export const isLanguageCode = (value: unknown): value is LanguageCode =>
  typeof value === 'string' && languages.includes(value as LanguageCode)

export const regionByCode = (code: RegionCode): RegionDefinition =>
  regions.find((region) => region.code === code) ?? regions[0]

export const resolveRegion = (requested: string | null | undefined): RegionCode =>
  isRegionCode(requested) ? requested : defaultRegion

export const resolveLanguage = (requested: string | null | undefined): LanguageCode =>
  isLanguageCode(requested) ? requested : defaultLanguage

/** `es-419,es;q=0.9,en;q=0.8` → `es`; `en-US,en;q=0.9` → `en`; no match → null */
export const parseAcceptLanguage = (header: string | null): LanguageCode | null => {
  if (!header) return null

  const preferences = header
    .split(',')
    .map((part) => {
      const [tag, ...parameters] = part.trim().toLowerCase().split(';')
      const quality = parameters.find((parameter) => parameter.trim().startsWith('q='))
      return { tag, quality: quality ? Number(quality.trim().slice(2)) : 1 }
    })
    .filter(({ quality }) => Number.isFinite(quality) && quality > 0 && quality <= 1)
    .sort((a, b) => b.quality - a.quality)

  for (const { tag } of preferences) {
    if (tag === 'es' || tag?.startsWith('es-')) return 'es'
    if (tag === 'en' || tag?.startsWith('en-')) return 'en'
  }

  return null
}

/** BCP-47 hreflang tag for a region in a language: `en`, `en-VE`, `en-US`, `en-CO` */
export const hreflang = (language: LanguageCode, region: RegionCode): string => {
  const definition = regionByCode(region)

  return definition.country ? `${language}-${definition.country}` : language
}

/** `/{language}/{region}` path for any page combination */
export const pagePath = (language: LanguageCode, region: RegionCode): string =>
  `/${language}/${region}`

/** The two public international pages, for sitemap and hreflang alternates. */
export const allPages = (): { language: LanguageCode; region: RegionCode }[] =>
  languages.map((language) => ({ language, region: defaultRegion }))
