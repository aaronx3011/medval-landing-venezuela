import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ThemeVariables } from '@/components/ThemeVariables'
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser'
import { getCatalogStrings } from '@/i18n/catalog'
import { findCatalogPage, parseCatalogQuery } from '@/lib/catalogQuery'
import { defaultRegion, isLanguageCode, isRegionCode } from '@/regions'
import '@/app/(frontend)/catalog.css'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ lang: string; region: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!isLanguageCode(lang)) return {}
  const strings = getCatalogStrings(lang)
  const query = parseCatalogQuery(await searchParams)
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
    title: `${lang === 'es' ? 'Catálogo' : 'Catalog'} · Medval Venezuela`,
    description: strings.lead,
    alternates: {
      canonical: `/${lang}/int/catalogo`,
      languages: { es: '/es/int/catalogo', en: '/en/int/catalogo' },
    },
    robots:
      query.q || query.category !== 'all' || query.page > 1
        ? { index: false, follow: true }
        : undefined,
  }
}

export default async function CatalogPage({ params, searchParams }: Props) {
  const { lang, region } = await params
  if (!isLanguageCode(lang) || !isRegionCode(region)) notFound()
  const query = parseCatalogQuery(await searchParams)
  if (region !== defaultRegion) {
    const { catalogHref } = await import('@/lib/catalogQuery')
    permanentRedirect(catalogHref(`/${lang}/int/catalogo`, query))
  }

  const payload = await getPayload({ config })
  const [catalog, settings, regions] = await Promise.all([
    findCatalogPage(payload, lang, query),
    payload.findGlobal({ slug: 'site-settings' }),
    payload.find({
      collection: 'regions',
      where: { code: { equals: defaultRegion } },
      locale: lang,
      limit: 1,
    }),
  ])
  const pageRegion = regions.docs[0] ?? null

  return (
    <>
      <ThemeVariables theme={settings.theme} />
      <Header language={lang} region={pageRegion} />
      <main className="impilo-home">
        <CatalogBrowser
          key={`${query.q}:${query.category}:${catalog.page}`}
          {...catalog}
          language={lang}
          query={{ ...query, page: catalog.page }}
        />
      </main>
      <Footer language={lang} region={pageRegion} siteSettings={settings} />
    </>
  )
}
