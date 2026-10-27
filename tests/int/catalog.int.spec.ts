import { describe, expect, it } from 'vitest'

import {
  categoryLabel,
  searchCatalogItems,
  toCatalogItemView,
  type CatalogItemView,
} from '@/lib/catalog'
import type { CatalogItem } from '@/payload-types'

const item = (overrides: Partial<CatalogItemView> = {}): CatalogItemView => ({
  activeIngredient: 'Principio activo',
  category: 'otro',
  concentration: '500 mg / 2 mL',
  description: 'Descripción',
  id: '1',
  images: [],
  indications: null,
  keywords: '',
  laboratory: 'PISA',
  name: 'Producto',
  pharmaceuticalForm: 'Solución inyectable',
  presentation: 'Caja',
  prescriptionRequired: true,
  registrationNumber: null,
  slug: 'producto',
  warnings: null,
  ...overrides,
})

const catalog = [
  item({
    id: '1',
    name: 'Albúmina Humana 20 %',
    activeIngredient: 'Albúmina humana',
    category: 'derivado-plasma',
    description: 'Solución para infusión intravenosa',
    keywords: 'plasma, expansor',
    slug: 'albumina',
  }),
  item({
    id: '2',
    name: 'Agua Inyectable PISA 500 mL',
    activeIngredient: 'Agua estéril para uso inyectable',
    category: 'diluyente',
    description: 'Empleada para irrigación',
    slug: 'agua',
  }),
  item({
    id: '3',
    name: 'A.M.K. (Amikacina)',
    activeIngredient: 'Sulfato de amikacina',
    category: 'antibiotico',
    description: 'Antibiótico aminoglucósido',
    keywords: 'infección bacteriana',
    slug: 'amk',
  }),
]

describe('catalog search', () => {
  it('ignores accents and case', () => {
    expect(searchCatalogItems(catalog, 'ALBUMINA', 'all', 'es').map((entry) => entry.slug)).toEqual(
      ['albumina'],
    )
  })

  it('requires every term to match across the searchable fields', () => {
    expect(searchCatalogItems(catalog, 'agua irrigacion', 'all', 'es')).toHaveLength(1)
    expect(searchCatalogItems(catalog, 'agua albumina', 'all', 'es')).toHaveLength(0)
  })

  it('matches keywords and category labels', () => {
    expect(searchCatalogItems(catalog, 'infeccion', 'all', 'es')[0]?.slug).toBe('amk')
    expect(searchCatalogItems(catalog, 'antibiótico', 'all', 'es')[0]?.slug).toBe('amk')
    expect(searchCatalogItems(catalog, '', 'diluyente', 'es')[0]?.slug).toBe('agua')
  })

  it('returns everything with an empty query and resets cleanly', () => {
    expect(searchCatalogItems(catalog, '   ', 'all', 'es')).toHaveLength(3)
    expect(searchCatalogItems(catalog, '', 'otro', 'es')).toHaveLength(0)
  })

  it('uses the requested language for category labels', () => {
    expect(categoryLabel('derivado-plasma', 'es')).toBe('Derivado plasmático')
    expect(categoryLabel('derivado-plasma', 'en')).toBe('Plasma-derived')
  })
})

describe('toCatalogItemView', () => {
  it('flattens localized fields and media into a serializable view', () => {
    const doc = {
      id: 'abc',
      name: 'Agua Inyectable PISA',
      slug: 'agua',
      category: 'diluyente',
      description: 'Agua estéril',
      activeIngredient: 'Agua estéril',
      concentration: '500 mL',
      pharmaceuticalForm: 'Solución estéril',
      presentation: 'Frasco',
      laboratory: 'PISA',
      registrationNumber: 'Reg. No. 1',
      indications: 'Irrigación',
      warnings: null,
      keywords: 'agua',
      prescriptionRequired: true,
      images: [
        { id: 'image-1', image: { id: 'media-1', alt: 'Frasco', url: '/api/media/file/a.jpg' } },
      ],
    } as unknown as CatalogItem

    expect(toCatalogItemView(doc)).toEqual({
      activeIngredient: 'Agua estéril',
      category: 'diluyente',
      concentration: '500 mL',
      description: 'Agua estéril',
      id: 'abc',
      images: [{ alt: 'Frasco', url: '/api/media/file/a.jpg' }],
      indications: 'Irrigación',
      keywords: 'agua',
      laboratory: 'PISA',
      name: 'Agua Inyectable PISA',
      pharmaceuticalForm: 'Solución estéril',
      presentation: 'Frasco',
      prescriptionRequired: true,
      registrationNumber: 'Reg. No. 1',
      slug: 'agua',
      warnings: null,
    })
  })

  it('drops items without a name', () => {
    expect(toCatalogItemView({ name: '   ' } as CatalogItem)).toBeNull()
  })
})

describe('catalog seed assets', () => {
  it('has at least three products with multiple photos and files on disk', async () => {
    const { catalogSeedItems } = await import('@/seed/catalog')
    const { access } = await import('node:fs/promises')
    const path = await import('node:path')
    const { fileURLToPath } = await import('node:url')

    const dir = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../seed-assets/catalog',
    )

    expect(catalogSeedItems.length).toBeGreaterThanOrEqual(3)
    expect(new Set(catalogSeedItems.map((entry) => entry.slug)).size).toBe(catalogSeedItems.length)

    for (const entry of catalogSeedItems) {
      expect(entry.images.length, `${entry.slug} needs at least two photos`).toBeGreaterThanOrEqual(
        2,
      )
      for (const photo of entry.images) {
        await expect(access(path.join(dir, photo.file))).resolves.toBeUndefined()
        expect(photo.filename).toMatch(/^[a-z0-9-]+\.(jpg|png)$/)
      }
    }
  })
})
