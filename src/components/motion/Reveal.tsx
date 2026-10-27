'use client'

import { motion } from 'motion/react'

import { durations, easings } from '@/animations/motion'

type RevealProps = {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'none'
  className?: string
}

export const offsets = {
  up: { y: 28 },
  left: { x: -32 },
  right: { x: 32 },
  none: {},
}

export const Reveal = ({ children, delay = 0, direction = 'up', className }: RevealProps) => {
  const offset: { x?: number; y?: number } = offsets[direction]

  return (
    <motion.div
      className={className}
      // Keep server-rendered content visible if hydration is delayed or fails.
      initial={false}
      transition={{ duration: durations.base, delay, ease: easings.out }}
      viewport={{ margin: '-60px', once: true }}
      whileInView={{
        opacity: [0, 1],
        x: [offset.x ?? 0, 0],
        y: [offset.y ?? 0, 0],
      }}
    >
      {children}
    </motion.div>
  )
}
