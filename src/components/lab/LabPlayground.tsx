'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { getGsap } from '@/animations/gsap'
import { AnimatedIcon } from '@/components/icons/AnimatedIcon'
import { Reveal } from '@/components/motion/Reveal'
import { RevealText } from '@/components/motion/RevealText'
import { SectionTransition } from '@/components/motion/SectionTransition'
import { RotatingWord } from '@/components/home/Hero'

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

const rotatingWords = ['nos importa.', 'puedes confiar.', 'entregamos.', 'suministramos.']

const specialties = [
  'Oncología',
  'Cardiología',
  'Neumonología',
  'Urgencias y Cuidados Intensivos',
  'Hemofilia',
  'Insuficiencia Renal',
]

const asset = (path: string) => `/impilo/home/${path}`

const LabImage = ({
  alt = '',
  className,
  height,
  src,
  width,
}: {
  alt?: string
  className?: string
  height: number
  src: string
  width: number
}) => <Image alt={alt} className={className} height={height} src={src} unoptimized width={width} />

/**
 * Replicates ImpiloHome's reveal observer: once the wrapper carries
 * `is-animated`, the `data-reveal` / `data-impilo-section` / `data-impilo-svg`
 * CSS hooks in home.css take over and `is-visible` classes land on scroll.
 */
const useLabReveals = (rootRef: React.RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const revealables = Array.from(
      root.querySelectorAll<HTMLElement>('[data-impilo-section], [data-impilo-svg], [data-reveal]'),
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

    root.classList.add('is-animated')
    revealables.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [rootRef])
}

/** GSAP scrub demo: the box interpolates with scroll position, not time. */
const ScrubBox = () => {
  const boxRef = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const el = boxRef.current
    if (!el) return

    const { gsap } = getGsap()
    const tween = gsap.fromTo(
      el,
      { opacity: 0.25, rotate: -8, scale: 0.6 },
      {
        ease: 'none',
        opacity: 1,
        rotate: 0,
        scale: 1,
        scrollTrigger: { end: 'center center', scrub: true, start: 'top bottom', trigger: el },
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <div className="lab-scrub-stage">
      <div className="lab-scrub-box" data-lab-scrub ref={boxRef}>
        <span>scrub</span>
      </div>
    </div>
  )
}

/** Chip idle-highlight loop + hover logo pop-out, mirroring Especialidades. */
const ChipLab = () => {
  const [hovered, setHovered] = useState(false)
  const [highlighted, setHighlighted] = useState(0)

  useEffect(() => {
    if (hovered) return

    const interval = window.setInterval(() => {
      setHighlighted((value) => (value + 1) % specialties.length)
    }, 2400)

    return () => window.clearInterval(interval)
  }, [hovered])

  return (
    <ul
      className="lab-chips"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {specialties.map((specialty, index) => (
        <li
          className={`impilo-specialties__chip${
            !hovered && index === highlighted ? ' is-highlighted' : ''
          }`}
          key={specialty}
        >
          <LabImage
            alt=""
            className="impilo-specialties__chip-logo"
            height={22}
            src="/medval.svg"
            width={62}
          />
          <span>{specialty}</span>
        </li>
      ))}
    </ul>
  )
}

type LabPlaygroundProps = {
  generatedIcons: string[]
  icons: string[]
  inlineSvgs: Record<string, string>
}

/** "01-awareness-ribbon.svg" → "01 · Awareness Ribbon". */
const iconName = (file: string) => {
  const number = file.match(/^(\d+)/)?.[1] ?? ''
  const label = file
    .replace(/\.svg$/, '')
    .replace(/^\d+-/, '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return `${number} · ${label}`
}

export const LabPlayground = ({ generatedIcons, icons, inlineSvgs }: LabPlaygroundProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const [replayToken, setReplayToken] = useState(0)
  const [amplify, setAmplify] = useState(false)
  const [forceMotion, setForceMotion] = useState(false)
  useLabReveals(rootRef)

  return (
    <div className="lab" ref={rootRef}>
      <header className="lab-header">
        <p className="lab-eyebrow">lab / animaciones</p>
        <h1>Laboratorio de animaciones</h1>
        <p className="lab-note">
          Sandbox para probar primitivas de animación de la landing. No se indexa. Prueba con
          <code>prefers-reduced-motion</code> activado también.
        </p>
        <h1 className="lab-hero-word">
          Conectando salud, <RotatingWord words={rotatingWords} />
        </h1>
      </header>

      <section className="lab-section">
        <h2>Iconos · /icons (specs 01–21)</h2>
        <p className="lab-paragraph">
          Trazados desde los PNG de Gemini con VTracer (fondo <code>#F5F6F9</code> eliminado). Cada
          tarjeta reproduce su coreografía de <code>icons/&lt;nn&gt;-*.md</code>: intro (según se
          entra en viewport) → stay (loop) → out. El 08 (riñones variante) no tiene SVG.
        </p>
        <div className="lab-toolbar">
          <button
            className="lab-button"
            onClick={() => setReplayToken((token) => token + 1)}
            type="button"
          >
            ▶ Reproducir todo
          </button>
          <label className="lab-toggle">
            <input
              checked={amplify}
              onChange={(event) => setAmplify(event.target.checked)}
              type="checkbox"
            />
            exagerar amplitud
          </label>
          <label className="lab-toggle">
            <input
              checked={forceMotion}
              onChange={(event) => setForceMotion(event.target.checked)}
              type="checkbox"
            />
            forzar movimiento
          </label>
          <span className="lab-hint">
            ¿Solo ves fundidos? Activa <code>forzar movimiento</code>: tu sistema tiene
            <code>prefers-reduced-motion</code> activo.
          </span>
        </div>
        <div className={`lab-grid${amplify ? ' lab-amp' : ''}`}>
          {generatedIcons.map((icon, index) => {
            const spec = icon.match(/^(\d+)/)?.[1] ?? '00'
            const markup = inlineSvgs[icon]
            const pathCount = markup ? (markup.match(/<path/g) ?? []).length : 0
            // self-assembly intro: 350ms base + one step per path + settle
            const step = pathCount > 0 ? Math.min(90, Math.round(1400 / pathCount)) : 90
            const computedIntro = pathCount > 0 ? 400 + pathCount * step + 150 : undefined
            // grouped icons with a trailing draw (10's arrow) need extra time
            const introMs =
              spec === '02'
                ? undefined
                : spec === '10'
                  ? 1450
                  : spec === '14'
                    ? 2400
                    : computedIntro
                      ? computedIntro + (markup.includes('id="arrow"') ? 750 : 0)
                      : undefined

            return (
              <figure className="lab-icon" key={icon}>
                <AnimatedIcon
                  controls
                  forceMotion={forceMotion}
                  introMs={introMs}
                  label={iconName(icon)}
                  replayToken={replayToken}
                  size={96}
                  spec={spec}
                  staggerMs={index * 70}
                  staggerStep={step}
                  src={`/icons/${icon}`}
                  svgMarkup={markup}
                />
                <figcaption>{iconName(icon)}</figcaption>
              </figure>
            )
          })}
        </div>
      </section>

      <section className="lab-section">
        <h2>Iconos · public/impilo/home/how-it-works</h2>
        <div className="lab-grid">
          {icons.map((icon) => (
            <div className="lab-icon" data-impilo-svg key={icon}>
              <LabImage
                alt=""
                className="impilo-svg"
                height={96}
                src={asset(`how-it-works/${icon}`)}
                width={96}
              />
              <span>{icon}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="lab-section">
        <h2>&lt;Reveal&gt; · direcciones y delays</h2>
        <div className="lab-grid">
          <Reveal>
            <div className="lab-card">up</div>
          </Reveal>
          <Reveal direction="left">
            <div className="lab-card">left</div>
          </Reveal>
          <Reveal direction="right">
            <div className="lab-card">right</div>
          </Reveal>
          <Reveal direction="none">
            <div className="lab-card">none</div>
          </Reveal>
        </div>
        <div className="lab-grid">
          {[0, 0.08, 0.16, 0.24, 0.32].map((delay) => (
            <Reveal delay={delay} key={delay}>
              <div className="lab-card">delay {delay}s</div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="lab-section">
        <h2>&lt;SectionTransition&gt; · variantes</h2>
        <SectionTransition variant="fade">
          <div className="lab-card">fade</div>
        </SectionTransition>
        <SectionTransition variant="clip">
          <div className="lab-card">clip</div>
        </SectionTransition>
        <SectionTransition variant="slide">
          <div className="lab-card">slide</div>
        </SectionTransition>
      </section>

      <section className="lab-section">
        <h2>&lt;RevealText&gt; · split de líneas y párrafos</h2>
        <RevealText multiLine>
          <h3 className="lab-big">Titular dividido en líneas que suben con máscara.</h3>
        </RevealText>
        <RevealText delay={0.12}>
          <p className="lab-paragraph">
            Los párrafos hacen fade + subida con GSAP. El split espera la señal de hidratación
            (HydrationSignal) y a que las fuentes Gilroy carguen, igual que en la landing.
          </p>
        </RevealText>
      </section>

      <section className="lab-section lab-dark">
        <h2>CSS reveals · data-reveal + --reveal-delay</h2>
        <div className="lab-grid">
          {[0, 0.1, 0.2, 0.3].map((delay) => (
            <div
              className="lab-box"
              data-reveal
              key={delay}
              style={{ '--reveal-delay': `${delay}s` } as React.CSSProperties}
            >
              {delay}s
            </div>
          ))}
        </div>
        <div data-impilo-section>
          <p className="lab-paragraph">Esta caja usa data-impilo-section (fade de sección).</p>
        </div>
      </section>

      <section className="lab-section">
        <h2>Keyframes de home.css</h2>
        <div className="lab-grid">
          {icons.map((icon, index) => (
            <div className="lab-card lab-icon-card" key={icon}>
              <LabImage
                alt=""
                className={`lab-float${index % 2 === 0 ? ' lab-pulse' : ''}`}
                height={46}
                src={asset(`how-it-works/${icon}`)}
                width={46}
              />
              <span>{index % 2 === 0 ? 'float + pulse' : 'float'}</span>
            </div>
          ))}
        </div>
      </section>

      <ScrubBox />

      <section className="lab-section">
        <h2>Chips de especialidades · idle + hover</h2>
        <ChipLab />
        <p className="lab-paragraph">
          Sin hover: un chip se resalta y rota cada 2.4s. Con hover: el logo sale del pill y el chip
          crece.
        </p>
      </section>

      <section className="lab-section">
        <h2>Hover kit</h2>
        <div className="lab-hover-row">
          <a className="impilo-primary-button" href="#lab-top">
            <span>Botón primario</span>
          </a>
          <a className="impilo-text-link" href="#lab-top">
            Text link
          </a>
        </div>
        <div className="impilo-allies__logos lab-logos">
          {[0, 1, 2].map((index) => (
            <div key={index}>
              <span />
              <LabImage alt="" className="impilo-svg" height={48} src="/medval.svg" width={180} />
            </div>
          ))}
        </div>
      </section>

      <footer className="lab-footer">
        <Link href="/es/int" id="lab-top">
          ← volver a la landing
        </Link>
      </footer>
    </div>
  )
}
