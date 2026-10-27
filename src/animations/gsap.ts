'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

let registered = false

/**
 * Client-only GSAP entry point. Sections that animate with GSAP import this
 * helper so the library is bundled only where it is used, and the plugins are
 * registered exactly once.
 */
export const getGsap = () => {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger, SplitText)
    registered = true
  }

  return { gsap, ScrollTrigger, SplitText }
}
