import { getPayload } from 'payload'
import sharp from 'sharp'

import config from '../payload.config.js'
import { homeContent } from '../i18n/home.js'
import { getUIStrings } from '../i18n/strings.js'
import { regions, type LanguageCode } from '../regions.js'
import { assertSeedAllowed } from './assertSeedAllowed.js'
import { seedCatalog } from './catalog.js'

import type { Media } from '../payload-types.js'

const brand = {
  primary: '#e97829',
  secondary: '#3c3a78',
}

type PlaceholderImage = {
  file: string
  label: string
  background: string
  foreground: string
}

const placeholderImages: PlaceholderImage[] = [
  {
    file: 'medval-hero.svg',
    label: 'Portada MedVal',
    background: brand.secondary,
    foreground: '#ffffff',
  },
  {
    file: 'medval-services.svg',
    label: 'Servicios MedVal',
    background: brand.primary,
    foreground: '#ffffff',
  },
  {
    file: 'medval-about.svg',
    label: 'Equipo MedVal',
    background: '#f5f2ef',
    foreground: brand.secondary,
  },
  {
    file: 'medval-gallery-1.svg',
    label: 'Laboratorio',
    background: brand.secondary,
    foreground: brand.primary,
  },
  {
    file: 'medval-gallery-2.svg',
    label: 'Instrumentos',
    background: brand.primary,
    foreground: brand.secondary,
  },
  {
    file: 'medval-gallery-3.svg',
    label: 'Atención al cliente',
    background: '#ffffff',
    foreground: brand.secondary,
  },
]

const renderImage = (image: PlaceholderImage) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000">
      <rect width="1600" height="1000" fill="${image.background}"/>
      <circle cx="1300" cy="200" r="260" fill="${image.foreground}" opacity="0.18"/>
      <circle cx="300" cy="820" r="180" fill="${image.foreground}" opacity="0.12"/>
      <circle cx="800" cy="500" r="220" fill="${image.foreground}" opacity="0.9"/>
      <rect x="760" y="240" width="80" height="520" rx="16" fill="${image.foreground}" opacity="0.55"/>
      <rect x="540" y="460" width="520" height="80" rx="16" fill="${image.foreground}" opacity="0.55"/>
    </svg>`,
  )

const services = [
  {
    title: 'Productos farmacéuticos',
    description:
      'Productos farmacéuticos de alta calidad para soluciones de tratamiento integrales.',
  },
  {
    title: 'Equipos médicos',
    description: 'Equipos médicos avanzados para una atención efectiva en clínicas y hospitales.',
  },
  {
    title: 'Productos desechables',
    description:
      'Suministros médicos desechables certificados, diseñados para la seguridad, la comodidad y la higiene.',
  },
]

const englishServices = [
  {
    title: 'Pharmaceutical Products',
    description: 'High-quality pharmaceutical products for comprehensive treatment solutions.',
  },
  {
    title: 'Medical Equipment',
    description:
      'Providing advanced medical equipment for effective patient care in clinics and hospitals.',
  },
  {
    title: 'Disposable Products',
    description:
      'Certified disposable medical supplies designed for safety, convenience, and hygiene.',
  },
]

const englishMediaLabels: Record<string, string> = {
  'Portada MedVal': 'MedVal cover',
  'Servicios MedVal': 'MedVal services',
  'Equipo MedVal': 'MedVal team',
  Laboratorio: 'Laboratory',
  Instrumentos: 'Instruments',
  'Atención al cliente': 'Customer service',
}

/** Contact copy that is not part of the shared homepage content. */
const copy = {
  es: {
    contactHeading: 'Contacto',
    contactBody:
      'Cuéntanos qué medicamentos, equipos o insumos necesita tu institución y en qué país operas.',
  },
  en: {
    contactHeading: 'Contact',
    contactBody:
      'Tell us which medicines, equipment, or supplies your facility needs and where you operate.',
  },
} as const

type RegionSeo = {
  description: string
  title: string
}

type RegionCopy = {
  address: string
  companyName: string
  email: string
  phone: string
  seo: Record<LanguageCode, RegionSeo>
  whatsappNumber: string
}

/** Single Miami-based brand per the site backup; every region shares its contact details. */
const siteSeo: Record<LanguageCode, RegionSeo> = {
  en: {
    title: 'Medval Supplies — Quality Medical Solutions',
    description:
      'High-quality pharmaceutical products, medical equipment, and disposable products for clinics, hospitals, and healthcare professionals across Central & South America.',
  },
  es: {
    title: 'Medval Supplies — Soluciones médicas de calidad',
    description:
      'Productos farmacéuticos, equipos médicos y productos desechables de alta calidad para clínicas, hospitales y profesionales de la salud en Centro y Sudamérica.',
  },
}

const regionCopy: Record<(typeof regions)[number]['code'], RegionCopy> = {
  int: {
    companyName: 'Medval Supplies',
    whatsappNumber: '584120000000',
    phone: '+58 412 000 0000',
    email: 'info@medvalsupplies.com',
    address: '1200 Brickell Avenue, Miami, Florida 33131',
    seo: siteSeo,
  },
  ve: {
    companyName: 'Medval Supplies',
    whatsappNumber: '584120000000',
    phone: '+58 412 000 0000',
    email: 'info@medvalsupplies.com',
    address: '1200 Brickell Avenue, Miami, Florida 33131',
    seo: siteSeo,
  },
  us: {
    companyName: 'Medval Supplies',
    whatsappNumber: '13050000000',
    phone: '+1 305 000 0000',
    email: 'info@medvalsupplies.com',
    address: '1200 Brickell Avenue, Miami, Florida 33131',
    seo: siteSeo,
  },
  co: {
    companyName: 'Medval Supplies',
    whatsappNumber: '573100000000',
    phone: '+57 310 000 0000',
    email: 'info@medvalsupplies.com',
    address: '1200 Brickell Avenue, Miami, Florida 33131',
    seo: siteSeo,
  },
}

const seed = async () => {
  assertSeedAllowed()

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const mediaByLabel = new Map<string, Media>()

  for (const image of placeholderImages) {
    const existing = await payload.find({
      collection: 'media',
      where: { alt: { equals: image.label } },
      limit: 1,
    })

    if (existing.docs[0]) {
      mediaByLabel.set(image.label, existing.docs[0])
      await payload.update({
        collection: 'media',
        id: existing.docs[0].id,
        locale: 'en',
        data: { alt: englishMediaLabels[image.label] },
      })
      continue
    }

    const png = await sharp(renderImage(image)).png().toBuffer()

    const created = await payload.create({
      collection: 'media',
      data: { alt: image.label },
      file: {
        name: image.file.replace('svg', 'png'),
        data: png,
        mimetype: 'image/png',
        size: png.length,
      },
    })

    mediaByLabel.set(image.label, created)
    await payload.update({
      collection: 'media',
      id: created.id,
      locale: 'en',
      data: { alt: englishMediaLabels[image.label] },
    })
  }

  const hero = mediaByLabel.get('Portada MedVal')
  const servicesImage = mediaByLabel.get('Servicios MedVal')
  const aboutImage = mediaByLabel.get('Equipo MedVal')
  const galleryImages = [
    mediaByLabel.get('Laboratorio'),
    mediaByLabel.get('Instrumentos'),
    mediaByLabel.get('Atención al cliente'),
  ].filter((image) => image !== undefined)

  if (!hero || !servicesImage || !aboutImage || galleryImages.length !== 3) {
    throw new Error('Missing placeholder media')
  }

  const gallery: Media[] = galleryImages

  await seedCatalog(payload)

  // One landing per language (not per country); the region supplies the
  // per-market contact details and SEO at render time.
  for (const language of ['es', 'en'] as const) {
    const texts = copy[language]
    const content = homeContent[language]
    const strings = getUIStrings(language)
    const process = content.howItWorks.map((step) => {
      const highlighted = step.title.filter((part) => part.highlighted)
      const plain = step.title.filter((part) => !part.highlighted)

      return {
        description: step.description,
        highlight: highlighted
          .map((part) => part.text)
          .join('')
          .trim(),
        number: step.number,
        title: plain
          .map((part) => part.text)
          .join('')
          .trim(),
      }
    })

    await payload.updateGlobal({
      slug: 'landing',
      locale: language,
      data: {
        _status: 'published',
        heroTitle: content.hero.titleLineOne,
        heroAccent: content.hero.tagline,
        heroSubtitle: '',
        heroCtaLabel: content.hero.cta,
        heroSlides: [],
        bioHeading: content.bio.heading,
        bioBody: content.bio.paragraphs.join('\n\n'),
        bioStats: content.bio.stats,
        specialtiesHeading: content.specialties.heading,
        specialtiesDescription: content.specialties.description,
        specialties: content.specialties.items,
        productsHeading: content.integrations.title.join('\n'),
        productsDescription: content.integrations.text,
        services: (language === 'en' ? englishServices : services).map((service, index) => ({
          ...service,
          image: gallery[index % gallery.length].id,
          showImage: false,
        })),
        process,
        certificationsHeading: content.certifications.heading,
        certificationsDescription: content.certifications.description,
        certifications: content.certifications.items,
        alliancesEyebrow: content.alliances.eyebrow,
        alliancesHeading: content.alliances.heading,
        alliancesText: content.alliances.text,
        alliancesPartnersLabel: content.alliances.partnersLabel,
        alliancesPartners: [],
        alliancesHowLabel: content.alliances.howLabel,
        alliancesHow: content.alliances.how.map((text) => ({ text })),
        alliancesNote: content.alliances.note,
        ctaHeading: content.cta.title,
        ctaButtonLabel: content.cta.button,
        contactHeading: texts.contactHeading,
        contactBody: texts.contactBody,
        contactTitle: strings.contact.heading,
        contactTitleAccent: strings.contact.headingAccent,
        contactFormHeading: strings.contact.formHeading,
        contactFormDescription: strings.contact.formDescription,
      },
    })
  }

  // Shared site values only; per-region values live in the `regions` collection.
  // The live site's footer has no social links, so the array stays empty.
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      _status: 'published',
      logo: hero.id,
      socialLinks: [],
    },
  })

  // All regions share the single Miami-based brand; both languages get real SEO copy.
  for (const region of regions) {
    const values = regionCopy[region.code]

    const existing = await payload.find({
      collection: 'regions',
      where: { code: { equals: region.code } },
      limit: 1,
    })

    const doc =
      existing.docs[0] ??
      (await payload.create({
        collection: 'regions',
        data: { code: region.code },
      }))

    for (const language of ['es', 'en'] as const) {
      await payload.update({
        collection: 'regions',
        id: doc.id,
        locale: language,
        data: {
          companyName: values.companyName,
          whatsappNumber: values.whatsappNumber,
          phone: values.phone,
          email: values.email,
          address: values.address,
          ogImage: hero.id,
          seoTitle: values.seo[language].title,
          seoDescription: values.seo[language].description,
        },
      })
    }
  }

  payload.logger.info(
    'Seed completado: landing en 2 idiomas, catálogo, 4 regiones y configuración.',
  )
}

const isTransientMongoError = (error: unknown) => {
  const codeName = (error as { codeName?: string } | null)?.codeName

  return codeName === 'WriteConflict' || codeName === 'LockTimeout'
}

const runWithRetries = async (attempts = 3, backoffMs = 2000) => {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await seed()

      return
    } catch (error) {
      if (attempt === attempts || !isTransientMongoError(error)) {
        throw error
      }

      console.warn(`Error transitorio de Mongo, reintentando (${attempt}/${attempts - 1})…`)
      await new Promise((resolve) => setTimeout(resolve, backoffMs * attempt))
    }
  }
}

runWithRetries()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
