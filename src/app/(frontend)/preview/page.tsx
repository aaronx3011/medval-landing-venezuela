import Image from 'next/image'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import type { ReactNode } from 'react'

import config from '@/payload.config'
import { isEditorUser } from '@/access'
import { buildHomeContent } from '@/lib/landingContent'
import { resolveLanguage } from '@/regions'
import type { Media } from '@/payload-types'

type PreviewSearchParams = {
  global?: string
  locale?: string
}

async function getDraftPreview(params: PreviewSearchParams): Promise<ReactNode> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (!isEditorUser(user)) {
    return <p>Esta vista previa requiere una sesión de editor o administrador.</p>
  }

  const language = resolveLanguage(params.locale)

  if (params.global === 'landing') {
    const landing = await payload.findGlobal({
      slug: 'landing',
      locale: language,
      draft: true,
      overrideAccess: false,
      user: user ?? undefined,
    })

    const content = buildHomeContent(language, landing)

    return (
      <div className="preview">
        <h1>Vista previa · {language === 'es' ? 'Español' : 'English'} · borrador</h1>

        <section>
          <h2>
            {content.hero.titleLineOne} {content.hero.tagline}
          </h2>
          {content.hero.subtitle ? <p>{content.hero.subtitle}</p> : null}
          {content.hero.slides.length ? (
            <div className="preview-grid">
              {content.hero.slides.map((slide) => (
                <Image
                  alt=""
                  height={180}
                  key={slide.image}
                  src={slide.image}
                  unoptimized
                  width={320}
                />
              ))}
            </div>
          ) : null}
        </section>

        <section>
          <h2>{content.bio.heading}</h2>
          {content.bio.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <ul>
            {content.bio.stats.map((stat) => (
              <li key={stat.label}>
                {stat.value} · {stat.label}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>{content.specialties.heading}</h2>
          <p>{content.specialties.description}</p>
          <ul>
            {content.specialties.items.map((item) => (
              <li key={item.title}>{item.title}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>{content.integrations.title.join(' ')}</h2>
          <p>{content.integrations.text}</p>
          <ul>
            {content.integrations.items.map((item) => (
              <li key={item.title}>{item.title}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Servicios</h2>
          <ul>
            {content.howItWorks.map((step) => (
              <li key={step.number}>
                {step.number} {step.title.map((part) => part.text).join('')}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>{content.certifications.heading}</h2>
          <p>{content.certifications.description}</p>
          <ul>
            {content.certifications.items.map((item) => (
              <li key={item.title}>{item.title}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>{content.alliances.heading}</h2>
          <p>{content.alliances.text}</p>
          <ul>
            {content.alliances.how.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {content.alliances.partners.length ? (
            <div className="preview-grid">
              {content.alliances.partners.map((partner) => (
                <Image
                  alt={partner.alt}
                  height={64}
                  key={partner.src}
                  src={partner.src}
                  unoptimized
                  width={200}
                />
              ))}
            </div>
          ) : null}
        </section>

        <section>
          <h2>{content.cta.title}</h2>
          <p>{content.cta.button}</p>
        </section>
      </div>
    )
  }

  if (params.global === 'site-settings') {
    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
      draft: true,
      overrideAccess: false,
      user: user ?? undefined,
    })
    const logo = siteSettings.logo as Media | null | undefined

    return (
      <div className="preview">
        <h1>Configuración del sitio · borrador</h1>
        <p>
          Los valores por región (empresa, contacto, SEO) se editan en la colección
          <code> regions</code>.
        </p>
        <p>
          Logo: {logo?.alt ?? '—'}
          {logo?.url ? (
            <Image alt={logo.alt} height={64} src={logo.url} unoptimized width={200} />
          ) : null}
        </p>
        <ul>
          <li>Redes sociales: {siteSettings.socialLinks?.length ?? 0}</li>
          {siteSettings.theme?.primary ? (
            <li>Color principal: {siteSettings.theme.primary}</li>
          ) : null}
        </ul>
      </div>
    )
  }

  return <p>Falta el parámetro `global` (landing o site-settings).</p>
}

export default async function PreviewPage(props: { searchParams: Promise<PreviewSearchParams> }) {
  const params = await props.searchParams

  return getDraftPreview(params)
}
