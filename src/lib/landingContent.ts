import type { Landing as LandingGlobal, Media } from '@/payload-types'
import { homeContent, type HomeContent } from '@/i18n/home'
import type { LanguageCode } from '@/regions'

type UploadValue = Media | number | string | null | undefined

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const clean = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim()

  return trimmed ? trimmed : null
}

const mediaUrl = (value: UploadValue): string | null => {
  if (!value || typeof value !== 'object') return null

  return typeof value.url === 'string' && value.url ? value.url : null
}

const mediaAlt = (value: UploadValue): string | null => {
  if (!value || typeof value !== 'object') return null

  return clean(value.alt)
}

const paragraphs = (value: string | null | undefined): string[] | null => {
  const text = clean(value)
  if (!text) return null

  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

const highlightedTitle = (title: string | null, highlight: string | null) => {
  const parts: { highlighted?: boolean; text: string }[] = []

  if (title) parts.push({ text: title.endsWith(' ') ? title : `${title} ` })
  if (highlight) parts.push({ highlighted: true, text: highlight })

  return parts.length > 0 ? parts : [{ text: '' }]
}

/**
 * Turns the editable Landing global into the shape consumed by the homepage.
 * Every field is optional: when the client has not filled a field yet, the
 * approved static copy stays in place instead of rendering an empty section.
 */
export const buildHomeContent = (language: LanguageCode, landing: LandingGlobal): HomeContent => {
  const content = clone(homeContent[language])

  const heroTitle = clean(landing.heroTitle)
  if (heroTitle) content.hero.titleLineOne = heroTitle

  if (landing.heroAccent !== null && landing.heroAccent !== undefined) {
    content.hero.tagline = landing.heroAccent
  }

  content.hero.subtitle = clean(landing.heroSubtitle)

  const heroCta = clean(landing.heroCtaLabel)
  if (heroCta) content.hero.cta = heroCta

  const heroSlides = (landing.heroSlides ?? [])
    .map((slide) => mediaUrl(slide.image))
    .filter((url): url is string => Boolean(url))
  if (heroSlides.length > 0) {
    content.hero.slides = heroSlides.map((image) => ({ image }))
  }

  const bioHeading = clean(landing.bioHeading)
  if (bioHeading) content.bio.heading = bioHeading

  const bioParagraphs = paragraphs(landing.bioBody)
  if (bioParagraphs?.length) content.bio.paragraphs = bioParagraphs

  const bioImage = mediaUrl(landing.bioImage)
  if (bioImage) content.bio.image = bioImage

  const bioStats = (landing.bioStats ?? [])
    .map((stat) => ({ label: clean(stat.label), value: clean(stat.value) }))
    .filter((stat): stat is { label: string; value: string } => Boolean(stat.label && stat.value))
  if (bioStats.length > 0) content.bio.stats = bioStats

  const specialtiesHeading = clean(landing.specialtiesHeading)
  if (specialtiesHeading) content.specialties.heading = specialtiesHeading

  const specialtiesDescription = clean(landing.specialtiesDescription)
  if (specialtiesDescription) content.specialties.description = specialtiesDescription

  const specialties = (landing.specialties ?? [])
    .map((specialty) => ({
      description: clean(specialty.description) ?? '',
      title: clean(specialty.title),
    }))
    .filter((specialty): specialty is { description: string; title: string } =>
      Boolean(specialty.title),
    )
  if (specialties.length > 0) content.specialties.items = specialties

  const productsHeadingLines = (landing.productsHeading ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (productsHeadingLines.length > 0) content.integrations.title = productsHeadingLines

  const productsDescription = clean(landing.productsDescription)
  if (productsDescription) content.integrations.text = productsDescription

  const products = (landing.services ?? [])
    .map((product) => ({
      description: clean(product.description) ?? '',
      image: mediaUrl(product.image),
      showImage: Boolean(product.showImage),
      title: clean(product.title),
    }))
    .filter(
      (
        product,
      ): product is {
        description: string
        image: string | null
        showImage: boolean
        title: string
      } => Boolean(product.title),
    )
  if (products.length > 0) content.integrations.items = products

  const process = (landing.process ?? [])
    .map((step, index) => ({
      description: clean(step.description) ?? '',
      number: clean(step.number) ?? `${String(index + 1).padStart(2, '0')}.`,
      title: clean(step.title),
      highlight: clean(step.highlight),
    }))
    .filter(
      (
        step,
      ): step is {
        description: string
        highlight: string | null
        number: string
        title: string | null
      } => Boolean(step.title || step.highlight),
    )
  if (process.length > 0) {
    const fallbackIcons = homeContent[language].howItWorks

    content.howItWorks = process.map((step, index) => ({
      description: step.description,
      icon: fallbackIcons[index]?.icon ?? fallbackIcons[0]?.icon ?? 'IconOne.svg',
      number: step.number,
      title: highlightedTitle(step.title, step.highlight),
    }))
  }

  const certificationsHeading = clean(landing.certificationsHeading)
  if (certificationsHeading) content.certifications.heading = certificationsHeading

  const certificationsDescription = clean(landing.certificationsDescription)
  if (certificationsDescription) content.certifications.description = certificationsDescription

  const certifications = (landing.certifications ?? [])
    .map((certification) => ({
      category: clean(certification.category) ?? '',
      description: clean(certification.description) ?? '',
      title: clean(certification.title),
    }))
    .filter(
      (
        certification,
      ): certification is {
        category: string
        description: string
        title: string
      } => Boolean(certification.title),
    )
  if (certifications.length > 0) content.certifications.items = certifications

  const alliancesEyebrow = clean(landing.alliancesEyebrow)
  if (alliancesEyebrow) content.alliances.eyebrow = alliancesEyebrow

  const alliancesHeading = clean(landing.alliancesHeading)
  if (alliancesHeading) content.alliances.heading = alliancesHeading

  const alliancesText = clean(landing.alliancesText)
  if (alliancesText) content.alliances.text = alliancesText

  const alliancesPartnersLabel = clean(landing.alliancesPartnersLabel)
  if (alliancesPartnersLabel) content.alliances.partnersLabel = alliancesPartnersLabel

  const alliancesHowLabel = clean(landing.alliancesHowLabel)
  if (alliancesHowLabel) content.alliances.howLabel = alliancesHowLabel

  const alliancesHow = (landing.alliancesHow ?? [])
    .map((item) => clean(item.text))
    .filter((text): text is string => Boolean(text))
  if (alliancesHow.length > 0) content.alliances.how = alliancesHow

  const alliancesPartners = (landing.alliancesPartners ?? [])
    .map((partner) => ({
      alt: mediaAlt(partner.logo) ?? clean(partner.name),
      src: mediaUrl(partner.logo),
    }))
    .filter((partner): partner is { alt: string; src: string } =>
      Boolean(partner.alt && partner.src),
    )
  if (alliancesPartners.length > 0) content.alliances.partners = alliancesPartners

  const alliancesNote = clean(landing.alliancesNote)
  if (alliancesNote) content.alliances.note = alliancesNote

  const ctaHeading = clean(landing.ctaHeading)
  if (ctaHeading) content.cta.title = ctaHeading

  const ctaButtonLabel = clean(landing.ctaButtonLabel)
  if (ctaButtonLabel) content.cta.button = ctaButtonLabel

  return content
}
