import type { CatalogItem, Media } from '@/payload-types'
import type { LanguageCode } from '@/regions'

export type CatalogCategory = CatalogItem['category']

export type CatalogImage = {
  alt: string
  url: string
}

/** Flattened, serializable shape handed to the client search component. */
export type CatalogItemView = {
  activeIngredient: string
  category: CatalogCategory
  concentration: string
  description: string
  id: string
  images: CatalogImage[]
  indications: string | null
  keywords: string
  laboratory: string
  name: string
  pharmaceuticalForm: string
  presentation: string
  prescriptionRequired: boolean
  registrationNumber: string | null
  slug: string
  warnings: string | null
}

export const catalogCategoryLabels: Record<CatalogCategory, Record<LanguageCode, string>> = {
  antibiotico: { en: 'Antibiotic', es: 'Antibiótico' },
  analgesico: { en: 'Analgesic', es: 'Analgésico' },
  'derivado-plasma': { en: 'Plasma-derived', es: 'Derivado plasmático' },
  diluyente: { en: 'Diluent', es: 'Diluyente' },
  otro: { en: 'Other', es: 'Otro' },
}

export const catalogCategoryOrder: CatalogCategory[] = [
  'antibiotico',
  'analgesico',
  'derivado-plasma',
  'diluyente',
  'otro',
]

export const categoryLabel = (category: CatalogCategory, language: LanguageCode) =>
  catalogCategoryLabels[category][language]

const clean = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim()

  return trimmed ? trimmed : null
}

const mediaUrl = (value: CatalogItem['images'][number]['image']): string | null => {
  if (!value || typeof value !== 'object') return null

  const media = value as Media

  return typeof media.url === 'string' && media.url ? media.url : null
}

const mediaAlt = (value: CatalogItem['images'][number]['image'], fallback: string): string => {
  if (!value || typeof value !== 'object') return fallback

  return (value as Media).alt?.trim() || fallback
}

/** Converts a Payload document into the plain object the client can receive. */
export const toCatalogItemView = (doc: CatalogItem): CatalogItemView | null => {
  const name = clean(doc.name)
  if (!name) return null

  const images = (doc.images ?? [])
    .map((entry) => {
      const url = mediaUrl(entry.image)
      if (!url) return null

      return { alt: mediaAlt(entry.image, name), url }
    })
    .filter((image): image is CatalogImage => image !== null)

  return {
    activeIngredient: clean(doc.activeIngredient) ?? '',
    category: doc.category,
    concentration: clean(doc.concentration) ?? '',
    description: clean(doc.description) ?? '',
    id: String(doc.id),
    images,
    indications: clean(doc.indications),
    keywords: clean(doc.keywords) ?? '',
    laboratory: clean(doc.laboratory) ?? '',
    name,
    pharmaceuticalForm: clean(doc.pharmaceuticalForm) ?? '',
    presentation: clean(doc.presentation) ?? '',
    prescriptionRequired: Boolean(doc.prescriptionRequired),
    registrationNumber: clean(doc.registrationNumber),
    slug: doc.slug,
    warnings: clean(doc.warnings),
  }
}

export const normalizeCatalogSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export const catalogSearchText = (item: Partial<CatalogItemView>, language: LanguageCode) =>
  normalizeCatalogSearch(
    [
      item.name,
      item.activeIngredient,
      item.description,
      item.concentration,
      item.pharmaceuticalForm,
      item.presentation,
      item.laboratory,
      item.registrationNumber,
      item.indications,
      item.warnings,
      item.keywords,
      item.category ? categoryLabel(item.category, language) : '',
    ]
      .filter(Boolean)
      .join(' '),
  )

/**
 * Accent-insensitive, all-terms-must-match search. It runs in the browser over
 * the published catalog (a small dataset); moving to a server endpoint is a
 * drop-in change if the catalog grows.
 */
export const searchCatalogItems = (
  items: CatalogItemView[],
  query: string,
  category: CatalogCategory | 'all' = 'all',
  language: LanguageCode = 'es',
): CatalogItemView[] => {
  const terms = normalizeCatalogSearch(query)
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)

  return items.filter((item) => {
    if (category !== 'all' && item.category !== category) return false
    if (terms.length === 0) return true

    const haystack = catalogSearchText(item, language)

    return terms.every((term) => haystack.includes(term))
  })
}
