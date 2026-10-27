import { act, cleanup, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Hero } from '@/components/home/Hero'
import { homeContent } from '@/i18n/home'

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

describe('hero fixed headline and background rotation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    )
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it.each(['en', 'es'] as const)(
    'keeps the %s tagline fixed while images and category highlights rotate together',
    async (language) => {
      const content = homeContent[language].hero
      const { container } = render(createElement(Hero, { content }))
      const expectFrame = (index: number) => {
        expect(
          container.querySelector('.impilo-hero__word-text')?.textContent?.replace(/\u00a0/g, ''),
        ).toBe(content.tagline)
        expect(container.querySelectorAll('img.is-active')).toHaveLength(1)
        expect(container.querySelector('img.is-active')?.getAttribute('src')).toContain(
          content.slides[index].image,
        )
        expect(container.querySelectorAll('.impilo-hero__eyebrow-text .is-active')).toHaveLength(1)
        expect(container.querySelector('.impilo-hero__eyebrow-text .is-active')?.textContent).toBe(
          language === 'es'
            ? ['Medicamentos', 'equipos', 'insumos'][index]
            : ['Medicines', 'equipment', 'medical supplies'][index],
        )
      }

      expectFrame(0)
      for (let index = 0; index < content.slides.length; index++) {
        await advance(5999)
        expectFrame(index)
        await advance(1)
        expectFrame((index + 1) % content.slides.length)
      }
    },
  )

  it('keeps the phrase and image static with reduced motion', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    )
    const content = homeContent.en.hero
    const { container } = render(createElement(Hero, { content }))
    await advance(20000)
    expect(container.querySelector('.impilo-hero__word-text')?.textContent).toBe(content.tagline)
    expect(container.querySelector('img.is-active')?.getAttribute('src')).toContain(
      content.slides[0].image,
    )
    expect(vi.getTimerCount()).toBe(0)
    expect(container.querySelector('.impilo-hero__eyebrow-text .is-active')?.textContent).toBe(
      'Medicines',
    )
  })

  it.each([0, 3025, 3300, 3500])(
    'cancels the animation timer when unmounted at %s ms',
    async (time) => {
      const { unmount } = render(createElement(Hero, { content: homeContent.en.hero }))
      await advance(time)
      unmount()
      expect(vi.getTimerCount()).toBe(0)
    },
  )
})
