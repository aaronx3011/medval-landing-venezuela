import { describe, expect, it } from 'vitest'

import { offsets } from '@/components/motion/Reveal'

describe('scroll reveals (WEB-29)', () => {
  it('defines an offset per direction', () => {
    expect(Object.keys(offsets)).toEqual(['up', 'left', 'right', 'none'])
    expect(offsets.up).toEqual({ y: 28 })
    expect(offsets.none).toEqual({})
  })
})
