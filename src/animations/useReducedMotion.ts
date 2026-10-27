'use client'

import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(query)
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
}
const getSnapshot = () => window.matchMedia(query).matches
const getServerSnapshot = () => false

/** Keep CSS and JavaScript motion in sync, including preference changes mid-visit. */
export const useReducedMotion = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
