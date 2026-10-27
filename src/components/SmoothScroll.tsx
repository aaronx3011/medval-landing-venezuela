'use client'

import { gsap } from 'gsap'
import Lenis from 'lenis'
import { useEffect } from 'react'

import { getGsap } from '@/animations/gsap'

export const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const { ScrollTrigger } = getGsap()
    const lenis = new Lenis({ anchors: true, lerp: 0.12 })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis.raf(time * 1000)

    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
