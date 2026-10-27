import type { Metadata } from 'next'
import React from 'react'

import { Analytics } from '@/components/Analytics'
import { HydrationSignal } from '@/components/HydrationSignal'
import { Preloader } from '@/components/Preloader'
import { SmoothScroll } from '@/components/SmoothScroll'
import { isLanguageCode, type LanguageCode } from '@/regions'
import '../styles.css'
import '../theme.css'
import '../home.css'
import '../icon-animations.css'
import '../reduced-motion.css'

const resolve = (requested: string): LanguageCode => (isLanguageCode(requested) ? requested : 'es')

export async function generateMetadata(props: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await props.params
  const language = resolve(lang)

  return {
    description:
      language === 'en'
        ? 'High-quality pharmaceutical products, medical equipment, and disposable products for clinics, hospitals, and healthcare professionals.'
        : 'Productos farmacéuticos, equipos médicos y productos desechables de alta calidad para clínicas, hospitales y profesionales de la salud.',
    title: 'Medval Supplies',
  }
}

export default async function LanguageLayout(props: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { children, params } = props
  const { lang: requested } = await params
  const language = resolve(requested)

  return (
    <html lang={language}>
      <body>
        <Preloader language={language} />
        <noscript>
          <style>{'.preloader{display:none}'}</style>
        </noscript>
        <SmoothScroll>{children}</SmoothScroll>
        <Analytics />
        <HydrationSignal />
      </body>
    </html>
  )
}
