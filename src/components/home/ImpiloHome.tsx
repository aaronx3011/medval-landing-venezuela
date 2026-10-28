'use client'

import Image from 'next/image'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useReducedMotion } from '@/animations/useReducedMotion'
import { CountUp } from '@/components/home/CountUp'
import { Hero } from '@/components/home/Hero'
import { AnimatedIcon } from '@/components/icons/AnimatedIcon'
import { HOME_ICONS } from '@/components/icons/registry'
import { RevealText } from '@/components/motion/RevealText'
import type { HomeContent } from '@/i18n/home'
import type { LanguageCode } from '@/regions'

type ImpiloHomeProps = {
  /** Homepage copy merged from the Landing global and the static fallbacks. */
  content: HomeContent
  /** Inline SVG markup per icon filename (keyed as in /public/icons). */
  icons?: Record<string, string>
  language: LanguageCode
}

// The animated icon set mapped onto the page: specialty cards, service
// steps and product cards (the set lives in
// @/components/icons/registry, built by scripts/build-icons.mjs).
const specialtyIcons = HOME_ICONS.slice(0, 7)
const serviceIcons = HOME_ICONS.slice(7, 12)
const certificationIcons = HOME_ICONS.slice(12, 15)
const productIcons = HOME_ICONS.slice(15)

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

const revealDelay = (seconds: number) =>
  ({ '--reveal-delay': `${seconds}s` }) as React.CSSProperties

const asset = (path: string) => `/impilo/home/${path}`

const StaticImage = ({
  alt = '',
  className,
  height,
  loading,
  src,
  width,
}: {
  alt?: string
  className?: string
  height: number
  loading?: 'eager' | 'lazy'
  src: string
  width: number
}) => {
  const isSvg = src.endsWith('.svg')
  const classes = [className, isSvg ? 'impilo-svg' : ''].filter(Boolean).join(' ') || undefined

  return (
    <Image
      alt={alt}
      className={classes}
      data-impilo-svg={isSvg ? '' : undefined}
      height={height}
      loading={loading}
      src={src}
      unoptimized
      width={width}
    />
  )
}

const PrimaryButton = ({
  children,
  href = '#contacto',
  reveal = false,
}: {
  children: string
  href?: string
  reveal?: boolean
}) => (
  <a className="impilo-primary-button" data-reveal={reveal ? '' : undefined} href={href}>
    <span>{children}</span>
  </a>
)

const HighlightedTitle = ({
  title,
  variant,
}: {
  title: HomeContent['howItWorks'][number]['title']
  variant: 'blue' | 'green'
}) => (
  <h3 className={`impilo-step-title impilo-step-title--${variant}`}>
    {title.map((segment, index) => (
      <span className={segment.highlighted ? 'is-highlighted' : undefined} key={index}>
        {segment.text}
      </span>
    ))}
  </h3>
)

export const ImpiloHome = ({ content, icons = {}, language }: ImpiloHomeProps) => {
  const homeRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLElement>(null)
  const [hoveredSpecialties, setHoveredSpecialties] = useState(false)
  const [highlightedSpecialty, setHighlightedSpecialty] = useState(0)
  const [openedSpecialty, setOpenedSpecialty] = useState<number | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const section = howItWorksRef.current
    if (!section) return

    const steps = Array.from(section.querySelectorAll<HTMLElement>('.impilo-step'))
    if (steps.length === 0) return
    const staticLayout = window.matchMedia(
      '(max-width: 900px), (max-height: 700px), (prefers-reduced-motion: reduce)',
    )

    let raf = 0

    const render = () => {
      raf = 0

      if (staticLayout.matches) {
        for (const step of steps) step.removeAttribute('style')
        return
      }

      const rect = section.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      if (scrollable <= 0) return

      const progress = Math.min(1, Math.max(0, -rect.top / scrollable))
      const position = Math.min(steps.length - 1, progress * steps.length)
      // Strictly one step on screen: the active step cuts in, the rest cut out.
      const active = Math.round(position)

      steps.forEach((step, index) => {
        const visible = index === active
        step.classList.toggle('is-active', visible)
        step.style.transform = 'translateY(0)'
        step.style.opacity = visible ? '1' : '0'
      })
    }

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(render)
    }

    render()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    staticLayout.addEventListener('change', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      staticLayout.removeEventListener('change', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [content.howItWorks.length])

  useEffect(() => {
    // Idle attention loop: highlights one chip at a time until the visitor
    // hovers the grid, then stays paused until the pointer leaves.
    if (hoveredSpecialties || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const count = content.specialties.items.length
    const interval = window.setInterval(() => {
      setHighlightedSpecialty((value) => (value + 1) % count)
    }, 2400)

    return () => window.clearInterval(interval)
  }, [hoveredSpecialties, content.specialties.items.length, reducedMotion])

  useIsomorphicLayoutEffect(() => {
    const home = homeRef.current
    if (!home) return

    const revealables = Array.from(
      home.querySelectorAll<HTMLElement>('[data-impilo-section], [data-impilo-svg], [data-reveal]'),
    )
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.12 },
    )

    home.classList.add('is-animated')
    revealables.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="impilo-home" ref={homeRef}>
      <Hero content={content.hero} key={language} />

      <section className="impilo-bio" data-impilo-section id="sobre-medval">
        {content.bio.image ? (
          <div
            aria-hidden="true"
            className="impilo-bio__backdrop"
            style={{ backgroundImage: `url("${content.bio.image}")` }}
          />
        ) : null}
        <RevealText multiLine>
          <h2>{content.bio.heading}</h2>
        </RevealText>
        <div className="impilo-bio__copy">
          {content.bio.paragraphs.map((paragraph) => (
            <RevealText delay={0.1} key={paragraph}>
              <p>{paragraph}</p>
            </RevealText>
          ))}
        </div>
        <ul className="impilo-bio__stats" data-reveal style={revealDelay(0.16)}>
          {content.bio.stats.map((stat) => (
            <li key={stat.label}>
              <strong>
                <CountUp delay={0.5} value={stat.value} />
              </strong>
              <span>{stat.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="impilo-white-shell">
        <section className="impilo-specialties" id="especialidades">
          <RevealText multiLine>
            <h2>{content.specialties.heading}</h2>
          </RevealText>
          <RevealText delay={0.12}>
            <p className="impilo-specialties__lead">{content.specialties.description}</p>
          </RevealText>
          <ul
            className="impilo-specialties__grid"
            data-reveal
            style={revealDelay(0.18)}
            onMouseEnter={() => setHoveredSpecialties(true)}
            onMouseLeave={() => setHoveredSpecialties(false)}
          >
            {content.specialties.items.map((specialty, index) => {
              const icon = specialtyIcons[index]
              const isOpen = openedSpecialty === index

              return (
                <li key={specialty.title}>
                  <button
                    aria-expanded={isOpen}
                    className={`impilo-specialty-card${isOpen ? ' is-open' : ''}${
                      !reducedMotion && !hoveredSpecialties && index === highlightedSpecialty
                        ? ' is-highlighted'
                        : ''
                    }`}
                    onClick={() => setOpenedSpecialty(isOpen ? null : index)}
                    type="button"
                  >
                    {icon ? (
                      <AnimatedIcon
                        label={specialty.title}
                        size={64}
                        spec={icon.slice(0, 2)}
                        src={`/icons/${icon}`}
                        svgMarkup={icons[icon]}
                      />
                    ) : null}
                    <span className="impilo-specialty-card__title">{specialty.title}</span>
                    <span aria-hidden={!isOpen} className="impilo-specialty-card__desc">
                      <span>{specialty.description}</span>
                    </span>
                    <span className="impilo-specialty-card__toggle">
                      {isOpen ? content.specialties.closeLabel : content.specialties.openLabel}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <a
            aria-label={content.specialties.scrollCue}
            className="impilo-scroll-cue"
            href="#productos"
          >
            <svg
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </a>
        </section>

        <section aria-labelledby="solutions-heading" className="impilo-integrations" id="productos">
          <h2 id="solutions-heading">
            {content.integrations.title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
          <p className="impilo-integrations__lead">{content.integrations.text}</p>

          <ul className="impilo-integrations__products">
            {content.integrations.items.map((item, index) => {
              const icon = productIcons[index]

              return (
                <li className="impilo-integration-product" key={item.title}>
                  <div className="impilo-integration-product__visual" aria-hidden="true">
                    {item.showImage && item.image ? (
                      <Image
                        alt=""
                        className="impilo-integration-product__photo"
                        height={112}
                        loading="lazy"
                        sizes="112px"
                        src={item.image}
                        unoptimized
                        width={112}
                      />
                    ) : icon ? (
                      <AnimatedIcon
                        label={item.title}
                        size={72}
                        spec={icon.slice(0, 2)}
                        src={`/icons/${icon}`}
                        svgMarkup={icons[icon]}
                      />
                    ) : null}
                  </div>
                  <div className="impilo-integration-product__copy">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <section
        className="impilo-how-it-works"
        id="servicios"
        ref={howItWorksRef}
        style={{ '--steps': content.howItWorks.length } as React.CSSProperties}
      >
        <div className="impilo-how-it-works__sticky">
          {content.howItWorks.map((part, index) => {
            const variant = index % 2 === 0 ? 'blue' : 'green'
            const icon = serviceIcons[index]

            return (
              <article
                className={`impilo-step${index === 0 ? ' is-active' : ''}`}
                key={part.number}
              >
                <div className="impilo-step__copy">
                  <div className={`impilo-step__eyebrow impilo-step__eyebrow--${variant}`}>
                    <StaticImage height={46} src={asset(`how-it-works/${part.icon}`)} width={46} />
                    <span>{part.number}</span>
                  </div>
                  <HighlightedTitle title={part.title} variant={variant} />
                  <p>{part.description}</p>
                </div>

                <div className="impilo-step__visual">
                  <div className="impilo-step__image-box">
                    {icon ? (
                      <AnimatedIcon
                        label={part.title[0]?.text ?? part.number}
                        size={380}
                        spec={icon.slice(0, 2)}
                        src={`/icons/${icon}`}
                        svgMarkup={icons[icon]}
                      />
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <div className="impilo-white-shell">
        <section className="impilo-certifications" id="certificaciones">
          <RevealText multiLine>
            <h2>{content.certifications.heading}</h2>
          </RevealText>
          <RevealText delay={0.12}>
            <p className="impilo-certifications__lead">{content.certifications.description}</p>
          </RevealText>
          <div className="impilo-certifications__cards" data-reveal style={revealDelay(0.18)}>
            {content.certifications.items.map((certification, index) => {
              const icon = certificationIcons[index]

              return (
                <article className="impilo-certifications__card" key={certification.title}>
                  {icon ? (
                    <AnimatedIcon
                      label={certification.category}
                      size={44}
                      spec={icon.slice(0, 2)}
                      src={`/icons/${icon}`}
                      svgMarkup={icons[icon]}
                    />
                  ) : null}
                  <span className="impilo-certifications__category">{certification.category}</span>
                  <h3>{certification.title}</h3>
                  <p>{certification.description}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section aria-labelledby="alliances-heading" className="impilo-allies" id="alianzas">
          <article className="impilo-allies__card">
            <div className="impilo-allies__main">
              <div className="impilo-allies__intro">
                <div>
                  <span className="impilo-allies__eyebrow">{content.alliances.eyebrow}</span>
                  <h2 id="alliances-heading">{content.alliances.heading}</h2>
                </div>
                <p className="impilo-allies__lead">{content.alliances.text}</p>
              </div>

              <div className="impilo-allies__partners">
                <p className="impilo-allies__partners-label">{content.alliances.partnersLabel}</p>
                <ul className="impilo-allies__brands" aria-label={content.alliances.partnersLabel}>
                  {content.alliances.partners.map((logo) => (
                    <li key={logo.src}>
                      <Image
                        alt={logo.alt}
                        height={64}
                        loading="eager"
                        src={logo.src}
                        unoptimized
                        width={200}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="impilo-allies__how">
                <p className="impilo-allies__partners-label">{content.alliances.howLabel}</p>
                <ul>
                  {content.alliances.how.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <p className="impilo-allies__note">{content.alliances.note}</p>
            </div>
          </article>
        </section>

        <section className="impilo-cta" data-impilo-section>
          <RevealText delay={0.1}>
            <h2>{content.cta.title}</h2>
          </RevealText>
          <PrimaryButton href="#contacto" reveal>
            {content.cta.button}
          </PrimaryButton>
        </section>
      </div>
    </div>
  )
}
