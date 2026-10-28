import type { Payload } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import {
  catalogHref,
  catalogWhere,
  findCatalogPage,
  parseCatalogQuery,
  CATALOG_PAGE_SIZE,
} from '@/lib/catalogQuery'
import { catalogSearchText } from '@/lib/catalog'
import { navigationHref } from '@/components/sections'

describe('server catalog queries', () => {
  it('normalizes accented multi-word searches and always restricts publication', () => {
    const query = parseCatalogQuery({
      q: ' ALBÚMINA PISA ',
      category: 'derivado-plasma',
      page: '2',
    })
    expect(catalogWhere(query)).toEqual({
      and: [
        { published: { equals: true } },
        { category: { equals: 'derivado-plasma' } },
        { searchText: { contains: 'albumina' } },
        { searchText: { contains: 'pisa' } },
      ],
    })
    expect(catalogSearchText({ name: 'Albúmina', activeIngredient: 'Humana' }, 'es')).toContain(
      'albumina humana',
    )
  })

  it('rejects malformed parameters and encodes queries without injecting a URL', () => {
    expect(parseCatalogQuery({ q: ['x'], category: 'invalid', page: '-2' })).toEqual({
      q: '',
      category: 'all',
      page: 1,
    })
    expect(parseCatalogQuery({ page: '2.5' }).page).toBe(1)
    expect(parseCatalogQuery({ q: 'x'.repeat(500) }).q).toHaveLength(200)
    expect(catalogHref('/es/int/catalogo', { q: 'a&b', category: 'all', page: 2 })).toBe(
      '/es/int/catalogo?q=a%26b&page=2',
    )
  })

  it('fetches only 12 database records, including pages beyond the old 100-item ceiling', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [], totalDocs: 137, totalPages: 12 })
    await findCatalogPage({ find } as unknown as Payload, 'es', {
      q: '',
      category: 'all',
      page: 10,
    })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ page: 10, limit: 12, depth: 1, sort: ['name', 'id'] }),
    )
    expect(CATALOG_PAGE_SIZE).toBe(12)
  })

  it('clamps stale page numbers when filters or deletions reduce the result count', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [], totalDocs: 14, totalPages: 2 })
    const result = await findCatalogPage({ find } as unknown as Payload, 'en', {
      q: '',
      category: 'all',
      page: 20,
    })
    expect(result.page).toBe(2)
    expect(find).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }))
  })

  it('links catalog navigation to a page and other entries back to home anchors', () => {
    expect(navigationHref('catalogo', 'es')).toBe('/es/int/catalogo')
    expect(navigationHref('contacto', 'en')).toBe('/en/int#contacto')
  })
})
