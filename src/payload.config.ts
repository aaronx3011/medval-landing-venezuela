import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { CatalogItems } from './collections/CatalogItems'
import { QuoteRequests } from './collections/QuoteRequests'
import { Regions } from './collections/Regions'
import { Landing } from './globals/Landing'
import { SiteSettings } from './globals/SiteSettings'
import { migrations } from './migrations'
import { defaultLanguage, languages } from './regions'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' · Medval Supplies',
      description: 'Panel de contenido de Medval Supplies',
      defaultOGImageType: 'off',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/medval-icon.svg' }],
      openGraph: {
        description: 'Panel de contenido de Medval Supplies',
        siteName: 'Medval Supplies',
        title: 'Medval Supplies',
      },
      twitter: {
        card: 'summary',
        description: 'Panel de contenido de Medval Supplies',
        title: 'Medval Supplies',
      },
    },
    components: {
      providers: ['@/components/AdminThemeProvider#AdminThemeProvider'],
      graphics: {
        Logo: '@/components/admin/MedvalLogo#MedvalLogo',
        Icon: '@/components/admin/MedvalIcon#MedvalIcon',
      },
      beforeDashboard: ['@/components/admin/AdminDashboardIntro#AdminDashboardIntro'],
      beforeLogin: ['@/components/admin/AdminLoginIntro#AdminLoginIntro'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, CatalogItems, QuoteRequests, Regions],
  globals: [Landing, SiteSettings],
  editor: lexicalEditor(),
  // The CMS interface stays Spanish-only; content languages are a separate axis.
  i18n: {
    fallbackLanguage: 'es',
    supportedLanguages: { es },
    // Keep the panel free of Payload branding in the settings menu.
    translations: {
      es: {
        ...es.translations,
        general: {
          ...es.translations.general,
          payloadSettings: 'Configuración del panel',
        },
      },
    },
  },
  localization: {
    // `locale` here is the content language (es/en), not a market.
    // Markets live in the `regions` collection; see docs/adr/0002.
    defaultLocale: defaultLanguage,
    fallback: true,
    locales: languages,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  // NEXT_PUBLIC_SERVER_URL is the public origin; CSRF_ORIGINS adds extra allowed
  // origins at runtime (comma-separated), e.g. the WireGuard IP on staging.
  csrf: [
    ...(process.env.NEXT_PUBLIC_SERVER_URL ? [process.env.NEXT_PUBLIC_SERVER_URL] : []),
    ...(process.env.CSRF_ORIGINS
      ? process.env.CSRF_ORIGINS.split(',').map((origin) => origin.trim())
      : []),
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // DATABASE_URI is what the server compose files set; DATABASE_URL is what local dev uses
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || process.env.DATABASE_URL || '',
    migrationDir: path.resolve(dirname, 'migrations'),
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [],
})
