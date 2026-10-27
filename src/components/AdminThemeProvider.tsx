'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { themeVariablesCss } from '@/lib/theme'

export const AdminThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeCss, setThemeCss] = useState('')

  useEffect(() => {
    let active = true
    const loadTheme = async () => {
      const response = await fetch('/api/globals/site-settings', { cache: 'no-store' })
      if (!response.ok) return

      const settings = (await response.json()) as { theme?: Record<string, unknown> }
      if (active) setThemeCss(themeVariablesCss(settings.theme))
    }

    void loadTheme().catch(() => undefined)
    const interval = window.setInterval(() => void loadTheme().catch(() => undefined), 2000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  return (
    <>
      {themeCss ? <style>{`:root{${themeCss}}`}</style> : null}
      {children}
    </>
  )
}
