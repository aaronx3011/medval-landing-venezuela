'use client'

import { useEffect, useState } from 'react'

import { navigationHref, sectionIds } from '@/components/sections'
import { getUIStrings } from '@/i18n/strings'
import type { LanguageCode } from '@/regions'

export const MobileMenu = ({ language }: { language: LanguageCode }) => {
  const [open, setOpen] = useState(false)
  const strings = getUIStrings(language)

  useEffect(() => {
    if (!open) return

    const close = () => setOpen(false)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const desktop = window.matchMedia('(min-width: 1281px)')
    const onDesktop = () => {
      if (desktop.matches) close()
    }

    window.addEventListener('hashchange', close)
    window.addEventListener('keydown', onKey)
    desktop.addEventListener('change', onDesktop)

    return () => {
      window.removeEventListener('hashchange', close)
      window.removeEventListener('keydown', onKey)
      desktop.removeEventListener('change', onDesktop)
    }
  }, [open])

  return (
    <>
      <button
        aria-controls="mobile-nav"
        aria-expanded={open}
        aria-label={open ? strings.closeMenu : strings.openMenu}
        className="menu-toggle"
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>

      {open ? (
        <nav
          aria-label={strings.mobileMenu}
          className="mobile-nav"
          data-lenis-prevent
          id="mobile-nav"
        >
          {sectionIds.map((id) => (
            <a key={id} href={navigationHref(id, language)} onClick={() => setOpen(false)}>
              {strings.sectionLabels[id]}
            </a>
          ))}
        </nav>
      ) : null}
    </>
  )
}
