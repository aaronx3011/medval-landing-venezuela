'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { getGsap } from '@/animations/gsap'
import type { LanguageCode } from '@/regions'

const MIN_DURATION = 1200
const ESTIMATED_DURATION = 1800

let preloaderShown = false

export const Preloader = ({ language }: { language: LanguageCode }) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const decisionRef = useRef<boolean | null>(null)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (decisionRef.current === null) {
      decisionRef.current = !preloaderShown
      preloaderShown = true
    }

    if (!decisionRef.current) {
      setDone(true)
      return
    }

    const { gsap } = getGsap()
    let raf = 0
    let finished = false
    const start = performance.now()

    const finish = () => {
      if (finished) return
      finished = true
      setProgress(100)

      const overlay = overlayRef.current
      const content = contentRef.current
      if (!overlay) {
        setDone(true)
        return
      }

      const timeline = gsap.timeline({
        delay: 0.2,
        onComplete: () => setDone(true),
      })

      timeline.to(
        overlay,
        { yPercent: 120, borderRadius: '100px 100px 0 0', duration: 0.9, ease: 'power3.inOut' },
        0,
      )
      if (content) {
        timeline.to(content, { y: 360, duration: 0.9, ease: 'power3.inOut' }, 0)
        timeline.to(content, { opacity: 0, duration: 0.45, ease: 'power1.inOut' }, 0)
      }
    }

    const ready = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') {
        resolve()
        return
      }
      window.addEventListener('load', () => resolve(), { once: true })
    })

    const tick = () => {
      if (finished) return
      const elapsed = performance.now() - start
      const value = Math.min(99, (elapsed / ESTIMATED_DURATION) * 100)
      setProgress(value)
      if (value >= 99) {
        ready.then(finish)
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    ready.then(() => {
      const elapsed = performance.now() - start
      window.setTimeout(finish, Math.max(0, MIN_DURATION - elapsed))
    })

    return () => {
      cancelAnimationFrame(raf)
    }
  }, [])

  if (done) return null

  const label = language === 'es' ? 'Cargando' : 'Loading'
  const revealed = Math.max(0, 100 - progress)

  return (
    <div aria-hidden="true" className="preloader" ref={overlayRef}>
      <div className="preloader__content" ref={contentRef}>
        <Image
          alt=""
          className="preloader__logo"
          height={78}
          priority
          src="/medval-white.svg"
          style={{ clipPath: `inset(0 ${revealed}% 0 0)` }}
          width={220}
        />
        <p className="preloader__counter">
          {String(Math.min(100, Math.floor(progress))).padStart(2, '0')}
          <span className="preloader__label">{label}</span>
        </p>
      </div>
    </div>
  )
}
