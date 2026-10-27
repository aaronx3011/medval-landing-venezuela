import type { Metadata } from 'next'
import React from 'react'
import '../styles.css'
import '../theme.css'

export const metadata: Metadata = {
  title: 'Vista previa · Medval Supplies',
}

export default function PreviewLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
