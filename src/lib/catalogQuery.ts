import type { Payload, Where } from 'payload'

import { catalogCategoryOrder, normalizeCatalogSearch, toCatalogItemView } from './catalog'
import type { CatalogCategory } from './catalog'
import type { LanguageCode } from '../regions'

export const CATALOG_PAGE_SIZE = 12

type SearchParams = Record<string, string | string[] | undefined>

export const parseCatalogQuery = (params: SearchParams) => {
  const single = (value: string | string[] | undefined) => (typeof value === 'string' ? value : '')
  const q = single(params.q).trim().slice(0, 200)
  const rawCategory = single(params.category)
  const category: CatalogCategory | 'all' = catalogCategoryOrder.includes(
    rawCategory as CatalogCategory,
  )
    ? (rawCategory as CatalogCategory)
    : 'all'
  const rawPage = single(params.page)
  const number = /^\d+$/.test(rawPage) ? Number(rawPage) : 1
  const page = Number.isSafeInteger(number) && number > 0 ? Math.min(number, 10000) : 1

  return { q, category, page }
}

export type CatalogQuery = ReturnType<typeof parseCatalogQuery>

export const catalogWhere = ({ q, category }: CatalogQuery): Where => ({
  and: [
    { published: { equals: true } },
    ...(category !== 'all' ? [{ category: { equals: category } }] : []),
    ...[...new Set(normalizeCatalogSearch(q).split(/\s+/).filter(Boolean))]
      .slice(0, 12)
      .map((term) => ({ searchText: { contains: term } })),
  ],
})

export const catalogHref = (base: string, query: CatalogQuery) => {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.category !== 'all') params.set('category', query.category)
  if (query.page > 1) params.set('page', String(query.page))
  const search = params.toString()
  return `${base}${search ? `?${search}` : ''}`
}

/** Query the full database, but send only one page of published products to the browser. */
export const findCatalogPage = async (
  payload: Payload,
  language: LanguageCode,
  query: CatalogQuery,
) => {
  const find = (page: number) =>
    payload.find({
      collection: 'catalog-items',
      locale: language,
      fallbackLocale: 'es',
      where: catalogWhere(query),
      sort: ['name', 'id'],
      page,
      limit: CATALOG_PAGE_SIZE,
      depth: 1,
      // Local API bypasses access; the published constraint above is mandatory.
      overrideAccess: true,
    })

  let result = await find(query.page)
  const page = Math.min(query.page, Math.max(1, result.totalPages))
  if (page !== query.page) result = await find(page)

  return {
    items: result.docs.map(toCatalogItemView).filter((item) => item !== null),
    totalDocs: result.totalDocs,
    totalPages: Math.max(1, result.totalPages),
    page,
  }
}
