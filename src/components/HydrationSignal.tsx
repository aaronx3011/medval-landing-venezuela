'use client'

import { useEffect } from 'react'

/**
 * Marks the document as hydrated once React has taken over the server markup.
 * Client-only effects that mutate React-owned DOM (e.g. GSAP SplitText in
 * RevealText) wait for this signal, otherwise React's hydration pass can
 * regenerate the tree and clobber their changes.
 */
export const HydrationSignal = () => {
  useEffect(() => {
    document.documentElement.dataset.hydrated = 'true'
    window.dispatchEvent(new Event('app:hydrated'))
  }, [])

  return null
}
