import type { Metadata } from 'next'
import React from 'react'

import { HydrationSignal } from '@/components/HydrationSignal'
import { SmoothScroll } from '@/components/SmoothScroll'
import '../styles.css'
import '../theme.css'
import '../home.css'
import '../reduced-motion.css'
import '../icon-animations.css'
import './lab.css'

export const metadata: Metadata = {
  description: 'Sandbox para probar animaciones de la landing.',
  robots: { follow: false, index: false },
  title: 'Lab de animaciones · Medval',
}

/**
 * Standalone animation playground at `/lab` (noindex). Mirrors the `[lang]`
 * layout's providers (global CSS, smooth scroll, hydration signal) but skips
 * the preloader, header, footer and region machinery so animations can be
 * tested in isolation.
 */
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SmoothScroll>{children}</SmoothScroll>
        <HydrationSignal />
      </body>
    </html>
  )
}
