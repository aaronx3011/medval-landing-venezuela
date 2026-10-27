'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { useReducedMotion } from '@/animations/useReducedMotion'
import type { HomeContent } from '@/i18n/home'

const HOLD_MS = 3000
const ERASE_MS = 25
const TYPE_MS = 40
const PAUSE_MS = 100

const revealDelay = (seconds: number) =>
  ({ '--reveal-delay': `${seconds}s` }) as React.CSSProperties

/** Typewriter sequence for the lab's rotating-word demo. */
const useHeroRotation = (words: string[]) => {
  const [frame, setFrame] = useState({ index: 0, text: words[0], initial: true })

  useEffect(() => {
    if (words.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    let timer: number | undefined
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, ms)
      })

    const run = async () => {
      let index = 0
      while (!cancelled) {
        await sleep(HOLD_MS)

        for (let length = words[index].length - 1; length >= 0; length--) {
          await sleep(ERASE_MS)
          if (cancelled) return
          const text = words[index].slice(0, length)
          setFrame((current) => ({ ...current, text }))
        }

        await sleep(PAUSE_MS)
        if (cancelled) return
        index = (index + 1) % words.length

        for (let length = 1; length <= words[index].length; length++) {
          await sleep(TYPE_MS)
          if (cancelled) return
          setFrame({ index, text: words[index].slice(0, length), initial: false })
        }
      }
    }

    void run()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [words])

  const wordLength = words[frame.index].length
  const revealMs = Math.max(TYPE_MS, (wordLength - 1) * TYPE_MS)
  const slideMs =
    HOLD_MS + wordLength * ERASE_MS + PAUSE_MS + TYPE_MS + (frame.initial ? 0 : revealMs)

  return { ...frame, revealMs, slideMs }
}

const HeroWord = ({ text }: { text: string }) => (
  <span className="impilo-hero__word">
    <svg
      aria-hidden="true"
      className="impilo-hero__word-outline"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <rect height="100" rx="5" ry="5" width="100" x="0" y="0" />
    </svg>
    <span className="impilo-hero__word-text">{text || '\u00A0'}</span>
  </span>
)

/** The lab's standalone typewriter demo. */
export const RotatingWord = ({ words }: { words: string[] }) => {
  const { text } = useHeroRotation(words)
  return <HeroWord text={text} />
}

export const Hero = ({ content }: { content: HomeContent['hero'] }) => {
  const [index, setIndex] = useState(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (content.slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % content.slides.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [content.slides.length, reducedMotion])

  return (
    <section
      className="impilo-hero"
      id="inicio"
      style={
        {
          '--hero-reveal-duration': '800ms',
          '--hero-slide-duration': '6000ms',
        } as React.CSSProperties
      }
    >
      <div className="impilo-hero__media" aria-hidden="true">
        {content.slides.map((slide, imageIndex) => (
          <Image
            key={slide.image}
            src={slide.image}
            alt=""
            fill
            sizes="100vw"
            unoptimized
            loading={imageIndex === 0 ? 'eager' : 'lazy'}
            className={imageIndex === index ? 'is-active' : undefined}
          />
        ))}
      </div>

      <div className="impilo-hero__inner">
        <div className="impilo-hero__copy">
          <p className="impilo-hero__eyebrow" data-reveal>
            <span className="impilo-hero__eyebrow-text">
              {content.eyebrow.map((segment) => (
                <span
                  className={segment.slide === index ? 'is-active' : undefined}
                  key={segment.text}
                >
                  {segment.text}
                </span>
              ))}
            </span>
          </p>
          <h1 className="impilo-hero__title" data-reveal>
            {content.titleLineOne}
            {content.tagline ? (
              <>
                {' '}
                <span className="impilo-hero__word-slot">
                  <HeroWord text={content.tagline} />
                </span>
              </>
            ) : null}
          </h1>

          {content.subtitle ? (
            <p className="impilo-hero__subtitle" data-reveal style={revealDelay(0.1)}>
              {content.subtitle}
            </p>
          ) : null}

          <div className="impilo-hero__aside" data-reveal style={revealDelay(0.16)}>
            <a className="impilo-primary-button" href="#contacto">
              <span>{content.cta}</span>
              <svg
                aria-hidden="true"
                className="impilo-hero__button-arrow"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
