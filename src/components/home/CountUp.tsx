'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useReducedMotion } from '@/animations/useReducedMotion'

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Animated stat number: counts up from zero the first time it scrolls into
 * view. Decorations around the digits (e.g. "+15" vs "15+") are preserved.
 * Renders the final value on the server and with reduced motion.
 */
export const CountUp = ({
  delay = 0,
  duration = 2000,
  value,
}: {
  /** Seconds to wait after becoming visible before counting (lets reveals finish). */
  delay?: number
  duration?: number
  value: string
}) => {
  const target = Number(value.replace(/\D/g, '')) || 0
  const ref = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(target)
  const reducedMotion = useReducedMotion()

  useIsomorphicLayoutEffect(() => {
    const node = ref.current
    if (!node || target === 0) return
    if (typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let started = false

    // Reset before paint so the count starts from zero without a flash.
    setCount(0)

    const observer = new IntersectionObserver(
      (entries) => {
        if (started || !entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        started = true

        const startAt = performance.now() + delay * 1000
        const tick = (now: number) => {
          const progress = Math.min(1, Math.max(0, (now - startAt) / duration))
          setCount(Math.round(target * (1 - Math.pow(1 - progress, 3))))
          if (progress < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [target, duration, delay, reducedMotion])

  return (
    <span aria-label={value} ref={ref} role="img">
      <span aria-hidden="true">
        {value
          .split(/(\d+)/)
          .map((part, index) =>
            /^\d+$/.test(part) ? <span key={index}>{reducedMotion ? target : count}</span> : part,
          )}
      </span>
    </span>
  )
}
