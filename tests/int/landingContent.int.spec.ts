import type { Landing, Media } from '@/payload-types'
import { buildHomeContent } from '@/lib/landingContent'

import { describe, expect, it } from 'vitest'

const media = (url: string, alt = 'Imagen'): Media => ({ alt, id: url, url }) as unknown as Media

const landing = (data: Partial<Landing>): Landing => data as Landing

describe('buildHomeContent', () => {
  it('keeps the approved static copy when the CMS fields are empty', () => {
    const content = buildHomeContent('es', landing({}))

    expect(content.hero.titleLineOne).toBe('Para nosotros tu salud es')
    expect(content.hero.tagline).toBe('nuestra prioridad')
    expect(content.bio.heading).toBe('Sobre Medval')
    expect(content.integrations.items).toHaveLength(3)
    expect(content.alliances.partners).toHaveLength(3)
  })

  it('maps every editable homepage field and image', () => {
    const content = buildHomeContent(
      'es',
      landing({
        heroTitle: 'Título nuevo',
        heroAccent: 'destacado',
        heroSubtitle: 'Texto de apoyo',
        heroCtaLabel: 'Botón nuevo',
        heroSlides: [
          { id: 'slide-1', image: media('/api/media/file/hero-1.png') },
          { id: 'slide-2', image: media('/api/media/file/hero-2.png') },
        ],
        bioHeading: 'Nosotros nuevos',
        bioBody: 'Primer párrafo.\n\nSegundo párrafo.',
        bioImage: media('/api/media/file/about.png'),
        bioStats: [
          { id: 'stat-1', label: 'Países', value: '25+' },
          { id: 'stat-2', label: 'Años', value: '18' },
        ],
        specialtiesHeading: 'Especialidades nuevas',
        specialtiesDescription: 'Descripción de especialidades',
        specialties: [{ id: 'specialty-1', title: 'Oncología', description: 'Tratamientos' }],
        productsHeading: 'Productos\nnuevos',
        productsDescription: 'Descripción de productos',
        services: [
          {
            id: 'service-1',
            title: 'Medicamentos',
            description: 'Descripción',
            image: media('/api/media/file/product.png'),
            showImage: true,
          },
        ],
        process: [
          {
            id: 'step-1',
            number: '01.',
            title: 'Logística',
            highlight: 'y cadena de frío',
            description: 'Descripción del paso',
          },
        ],
        certificationsHeading: 'Certificaciones nuevas',
        certificationsDescription: 'Descripción de certificaciones',
        certifications: [
          { id: 'cert-1', category: 'Calidad', title: 'Documentación', description: 'Detalle' },
        ],
        alliancesEyebrow: 'Etiqueta',
        alliancesHeading: 'Alianzas nuevas',
        alliancesText: 'Texto de alianzas',
        alliancesPartnersLabel: 'Marcas',
        alliancesPartners: [
          {
            id: 'partner-1',
            name: 'Aliado',
            url: 'https://example.com',
            logo: media('/api/media/file/partner.png', 'Aliado'),
          },
        ],
        alliancesHowLabel: 'Cómo trabajamos',
        alliancesHow: [{ id: 'how-1', text: 'Punto de trabajo' }],
        alliancesNote: 'Nota final',
        ctaHeading: 'Cierre nuevo',
        ctaButtonLabel: 'Hablemos',
      }),
    )

    expect(content.hero).toMatchObject({
      cta: 'Botón nuevo',
      subtitle: 'Texto de apoyo',
      tagline: 'destacado',
      titleLineOne: 'Título nuevo',
    })
    expect(content.hero.slides.map((slide) => slide.image)).toEqual([
      '/api/media/file/hero-1.png',
      '/api/media/file/hero-2.png',
    ])
    expect(content.bio).toMatchObject({
      heading: 'Nosotros nuevos',
      image: '/api/media/file/about.png',
      paragraphs: ['Primer párrafo.', 'Segundo párrafo.'],
      stats: [
        { label: 'Países', value: '25+' },
        { label: 'Años', value: '18' },
      ],
    })
    expect(content.specialties.items).toEqual([{ description: 'Tratamientos', title: 'Oncología' }])
    expect(content.integrations.title).toEqual(['Productos', 'nuevos'])
    expect(content.integrations.items).toEqual([
      {
        description: 'Descripción',
        image: '/api/media/file/product.png',
        showImage: true,
        title: 'Medicamentos',
      },
    ])
    expect(content.howItWorks[0]).toMatchObject({
      description: 'Descripción del paso',
      number: '01.',
      title: [{ text: 'Logística ' }, { highlighted: true, text: 'y cadena de frío' }],
    })
    expect(content.certifications.items).toEqual([
      { category: 'Calidad', description: 'Detalle', title: 'Documentación' },
    ])
    expect(content.alliances).toMatchObject({
      eyebrow: 'Etiqueta',
      heading: 'Alianzas nuevas',
      how: ['Punto de trabajo'],
      howLabel: 'Cómo trabajamos',
      note: 'Nota final',
      partners: [{ alt: 'Aliado', src: '/api/media/file/partner.png' }],
      partnersLabel: 'Marcas',
      text: 'Texto de alianzas',
    })
    expect(content.cta).toEqual({ button: 'Hablemos', title: 'Cierre nuevo' })
  })

  it('supports a process title that is entirely highlighted', () => {
    const content = buildHomeContent(
      'es',
      landing({
        process: [
          {
            id: 'step-3',
            number: '03.',
            title: '',
            highlight: 'Mantenimiento',
            description: 'Plan preventivo',
          },
        ],
      }),
    )

    expect(content.howItWorks[0]).toMatchObject({
      number: '03.',
      title: [{ highlighted: true, text: 'Mantenimiento' }],
    })
  })

  it('hides the highlighted word when the client clears it', () => {
    const content = buildHomeContent('es', landing({ heroAccent: '' }))

    expect(content.hero.tagline).toBe('')
  })
})
