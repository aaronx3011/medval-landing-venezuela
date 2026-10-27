'use client'

import { useGSAP } from '@gsap/react'
import { useRef } from 'react'

import { getGsap } from '@/animations/gsap'

type ParallaxProps = {
  children: React.ReactNode
  className?: string
  strength?: number
}

export const Parallax = ({ children, className, strength = 0.18 }: ParallaxProps) => {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const { gsap } = getGsap()

      gsap.to('[data-parallax-inner]', {
        ease: 'none',
        scrollTrigger: {
          end: 'bottom top',
          scrub: true,
          start: 'top bottom',
          trigger: container.current,
        },
        yPercent: strength * 100,
      })
    },
    { scope: container },
  )

  return (
    <div className={className} ref={container}>
      <div data-parallax-inner>{children}</div>
    </div>
  )
}
