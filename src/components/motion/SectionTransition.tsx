'use client'

import { motion } from 'motion/react'

import { durations, easings } from '@/animations/motion'

type SectionTransitionProps = {
  children: React.ReactNode
  className?: string
  variant?: 'fade' | 'clip' | 'slide'
}

export const SectionTransition = ({
  children,
  className,
  variant = 'fade',
}: SectionTransitionProps) => {
  const animateByVariant = {
    fade: { opacity: [0, 1], y: [40, 0] },
    clip: { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'], opacity: [0.4, 1] },
    slide: { opacity: [0, 1], x: [-48, 0] },
  }

  return (
    <motion.div
      className={className}
      // Animate on entry without making visibility depend on JavaScript.
      initial={false}
      transition={{ duration: durations.slow, ease: easings.out }}
      viewport={{ margin: '-15% 0px', once: true }}
      whileInView={animateByVariant[variant]}
    >
      {children}
    </motion.div>
  )
}
