'use client'

import { motion, useReducedMotion } from 'motion/react'

import { durations, easings } from '@/animations/motion'

type InteractiveProps = {
  children: React.ReactNode
  className?: string
  href?: string
  onClick?: () => void
  ariaLabel?: string
  target?: string
  rel?: string
}

const buttonMotion = (prefersReduced: boolean) =>
  prefersReduced
    ? {}
    : {
        whileHover: { scale: 1.04, y: -2 },
        whileTap: { scale: 0.97 },
        transition: { duration: durations.instant, ease: easings.out },
      }

export const InteractiveButton = ({
  children,
  className,
  href,
  onClick,
  ariaLabel,
  target,
  rel,
}: InteractiveProps) => {
  const prefersReduced = useReducedMotion()

  if (href) {
    return (
      <motion.a
        aria-label={ariaLabel}
        className={className}
        href={href}
        rel={rel}
        target={target}
        {...buttonMotion(prefersReduced === true)}
      >
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button
      aria-label={ariaLabel}
      className={className}
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
      {...buttonMotion(prefersReduced === true)}
    >
      {children}
    </motion.button>
  )
}

export const InteractiveCard = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      {...(prefersReduced
        ? {}
        : {
            whileHover: { y: -6 },
            transition: { duration: durations.fast, ease: easings.out },
          })}
    >
      {children}
    </motion.div>
  )
}
