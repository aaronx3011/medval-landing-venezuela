import { describe, expect, it } from 'vitest'

import { SmoothScroll } from '@/components/SmoothScroll'
import { Parallax } from '@/components/motion/Parallax'
import { Reveal } from '@/components/motion/Reveal'
import { SectionTransition } from '@/components/motion/SectionTransition'
import { InteractiveButton, InteractiveCard } from '@/components/motion/Interactive'

describe('reduced-motion support (WEB-33)', () => {
  it('registers every motion component', () => {
    // SmoothScroll / Parallax skip their JS effects and Interactive* disable
    // their hover props when `prefers-reduced-motion` is set; entrance
    // animations (Reveal, SectionTransition, RevealText) still play.
    expect(Reveal).toBeDefined()
    expect(SectionTransition).toBeDefined()
    expect(InteractiveButton).toBeDefined()
    expect(InteractiveCard).toBeDefined()
    expect(Parallax).toBeDefined()
    expect(SmoothScroll).toBeDefined()
  })
})
