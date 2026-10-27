import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { notFound, permanentRedirect } from 'next/navigation'

import config from '@/payload.config'
import { Footer } from '@/components/Footer'
import { buildHomeContent } from '@/lib/landingContent'
import { toCatalogItemView } from '@/lib/catalog'
import { Header } from '@/components/Header'
import { Contact } from '@/components/sections/Contact'
import { ThemeVariables } from '@/components/ThemeVariables'
import { SectionTransition } from '@/components/motion/SectionTransition'
import { ImpiloHome } from '@/components/home/ImpiloHome'
import { loadIcons } from '@/components/icons/server'
import {
  allPages,
  defaultRegion,
  hreflang,
  isLanguageCode,
  isRegionCode,
  pagePath,
  resolveLanguage,
  type LanguageCode,
} from '@/regions'
import type { Media, Region as RegionGlobal } from '@/payload-types'
import type { Payload } from 'payload'

export const dynamic = 'force-dynamic'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** Only the Spanish and English international pages are public hreflang targets. */
const languageAlternates = () =>
  Object.fromEntries([
    ...allPages().map(({ language, region }) => [
      hreflang(language, region),
      `${baseUrl}${pagePath(language, region)}`,
    ]),
    ['x-default', `${baseUrl}${pagePath('es', defaultRegion)}`],
  ])

type PageRegion = RegionGlobal | null

const findRegion = async (payload: Payload, language: LanguageCode): Promise<PageRegion> => {
  const { docs } = await payload.find({
    collection: 'regions',
    where: { code: { equals: defaultRegion } },
    locale: language,
    limit: 1,
  })

  return docs[0] ?? null
}

export async function generateMetadata(props: {
  params: Promise<{ lang: string; region: string }>
}): Promise<Metadata> {
  const { lang, region } = await props.params

  if (!isLanguageCode(lang) || region !== defaultRegion) {
    return {}
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const pageRegion = await findRegion(payload, resolveLanguage(lang))

  const ogImage = pageRegion?.ogImage as Media | null | undefined
  const ogImageUrl = ogImage?.url ? new URL(ogImage.url, baseUrl).toString() : null

  return {
    metadataBase: new URL(baseUrl),
    title: pageRegion?.seoTitle || 'Medval Supplies',
    description: pageRegion?.seoDescription || undefined,
    alternates: {
      canonical: pagePath(resolveLanguage(lang), defaultRegion),
      languages: languageAlternates(),
    },
    openGraph: {
      description: pageRegion?.seoDescription || undefined,
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
      title: pageRegion?.seoTitle || 'Medval Supplies',
      type: 'website',
    },
  }
}

export default async function RegionLandingPage(props: {
  params: Promise<{ lang: string; region: string }>
}) {
  const { lang: requestedLang, region: requestedRegion } = await props.params

  if (!isLanguageCode(requestedLang) || !isRegionCode(requestedRegion)) {
    notFound()
  }
  if (requestedRegion !== defaultRegion) {
    permanentRedirect(pagePath(requestedLang, defaultRegion))
  }

  const language = resolveLanguage(requestedLang)
  const region = defaultRegion

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [landing, siteSettings, pageRegion, catalog] = await Promise.all([
    payload.findGlobal({ slug: 'landing', locale: language }),
    payload.findGlobal({ slug: 'site-settings' }),
    findRegion(payload, language),
    payload.find({
      collection: 'catalog-items',
      where: { published: { equals: true } },
      locale: language,
      sort: 'name',
      limit: 100,
    }),
  ])

  const catalogItems = catalog.docs
    .map((item) => toCatalogItemView(item))
    .filter((item): item is NonNullable<typeof item> => item !== null)

  return (
    <>
      <ThemeVariables theme={siteSettings.theme} />
      <Header region={pageRegion} language={language} />

      <main>
        <ImpiloHome
          catalogItems={catalogItems}
          content={buildHomeContent(language, landing)}
          icons={loadIcons()}
          language={language}
        />

        <SectionTransition variant="fade">
          <Contact landing={landing} region={pageRegion} regionCode={region} language={language} />
        </SectionTransition>
      </main>

      <Footer region={pageRegion} siteSettings={siteSettings} language={language} />
    </>
  )
}
