import { describe, expect, it } from 'vitest'

import { Parallax } from '@/components/motion/Parallax'
import { SmoothScroll } from '@/components/SmoothScroll'
import { Reveal } from '@/components/motion/Reveal'

describe('scroll effects (WEB-30)', () => {
  it('exports the motion components', () => {
    expect(Parallax).toBeDefined()
    expect(Reveal).toBeDefined()
    expect(SmoothScroll).toBeDefined()
  })
})
