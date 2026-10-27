'use client'

import type { SplitText as SplitTextType } from 'gsap/SplitText'
import { useEffect, useLayoutEffect, useRef } from 'react'

import { getGsap } from '@/animations/gsap'
import { useReducedMotion } from '@/animations/useReducedMotion'

type RevealTextProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  multiLine?: boolean
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Resolves once React has finished hydrating the server markup (see
 * HydrationSignal), so the split never runs while React still owns the DOM.
 */
const whenHydrated = () => {
  if (typeof document === 'undefined') return Promise.resolve()

  return new Promise<void>((resolve) => {
    if (document.documentElement.dataset.hydrated === 'true') {
      resolve()
      return
    }

    window.addEventListener('app:hydrated', () => resolve(), { once: true })
  })
}

/**
 * Ports the reference site's TextAnimation: headlines split into lines that
 * slide up out of an overflow mask, paragraphs fade in. Content ships in the
 * SSR HTML and is only hidden once GSAP takes over on the client.
 *
 * SplitText runs on the first element child (the heading itself, not the
 * wrapper), otherwise it clones the block element once per line and every
 * clone keeps the element's own margins, which breaks the vertical rhythm.
 */
export const RevealText = ({
  children,
  className,
  delay = 0,
  multiLine = false,
}: RevealTextProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useIsomorphicLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const { gsap, ScrollTrigger, SplitText } = getGsap()

    let split: SplitTextType | null = null
    let timeline: ReturnType<typeof gsap.timeline> | null = null
    let trigger: ReturnType<typeof ScrollTrigger.create> | null = null
    let tween: ReturnType<typeof gsap.to> | null = null
    let observer: MutationObserver | null = null
    let cancelled = false

    const cleanup = () => {
      cancelled = true
      observer?.disconnect()
      observer = null
      trigger?.kill()
      timeline?.kill()
      tween?.kill()
      split?.revert()
      gsap.set(element, { clearProps: 'opacity,transform' })
    }

    if (multiLine) {
      const originalHTML = element.innerHTML

      gsap.set(element, { opacity: 0 })

      const fontsReady = document.fonts
        ? Promise.all([
            document.fonts.load('400 1em Gilroy'),
            document.fonts.load('600 1em Gilroy'),
          ]).catch(() => undefined)
        : Promise.resolve()

      const build = () => {
        if (cancelled) return

        trigger?.kill()
        timeline?.kill()

        if (element.querySelector('.reveal-text__mask')) {
          split?.revert()
        } else {
          // React patched the element back to its server markup: restore the
          // full text before splitting again.
          element.innerHTML = originalHTML
        }

        const target =
          element.firstElementChild instanceof HTMLElement ? element.firstElementChild : element

        split = new SplitText(target, { type: 'lines', linesClass: 'reveal-text__line' })

        for (const line of split.lines) {
          const mask = document.createElement('span')
          mask.className = 'reveal-text__mask'
          line.parentNode?.insertBefore(mask, line)
          mask.appendChild(line)
        }

        gsap.set(split.lines, { yPercent: 110 })

        timeline = gsap.timeline({
          paused: true,
          delay,
          onStart: () => gsap.set(element, { opacity: 1 }),
        })

        timeline.to(split.lines, {
          yPercent: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.14,
        })

        trigger = ScrollTrigger.create({
          trigger: element,
          start: 'top 85%',
          once: true,
          onEnter: () => timeline?.play(),
        })

        if (element.getBoundingClientRect().top <= window.innerHeight * 0.85) {
          timeline.play()
        }
      }

      observer = new MutationObserver(() => {
        if (cancelled || element.querySelector('.reveal-text__mask')) return
        build()
      })

      observer.observe(element, { childList: true, subtree: true })

      Promise.all([fontsReady, whenHydrated()]).then(build, build)

      return cleanup
    }

    gsap.set(element, { opacity: 0, y: 24 })

    tween = gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay,
      ease: 'power3.out',
      paused: true,
    })

    trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 88%',
      once: true,
      onEnter: () => tween?.play(),
    })

    if (element.getBoundingClientRect().top <= window.innerHeight * 0.88) {
      tween.play()
    }

    return cleanup
  }, [delay, multiLine, reducedMotion])

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  )
}
