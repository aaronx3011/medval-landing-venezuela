'use client'

import { useEffect } from 'react'

export const HeaderScrollEffect = () => {
  useEffect(() => {
    const header = document.querySelector('.site-header')
    if (!header) return

    const update = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 32)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })

    return () => window.removeEventListener('scroll', update)
  }, [])

  return null
}
