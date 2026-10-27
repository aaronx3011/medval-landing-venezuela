import { expect, test, type Page } from '@playwright/test'

test('keeps the hero photo subjects visible above mobile copy', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/es/int')
  await expect(page.locator('.preloader')).toHaveCount(0)
  // Subject bounds measured in the source photographs, as fractions of the image.
  // These cover the medicine box, operating-room monitor, and microscope.
  const subjects = [
    { left: 0.64, right: 0.86, top: 0.5, bottom: 0.72 },
    { left: 0.71, right: 0.99, top: 0.33, bottom: 0.85 },
    { left: 0.71, right: 0.98, top: 0.1, bottom: 0.64 },
  ]
  for (const viewport of [
    { width: 320, height: 740 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 641, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 568 },
  ]) {
    await page.setViewportSize(viewport)
    const problems = await page
      .locator('.impilo-hero__media img')
      .evaluateAll((images, subjects) => {
        const copyTop = document.querySelector('.impilo-hero__copy')!.getBoundingClientRect().top
        return images.flatMap((node, index) => {
          const image = node as HTMLImageElement
          const wasActive = image.classList.contains('is-active')
          image.classList.add('is-active')
          const box = image.getBoundingClientRect()
          const scale = Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight)
          const [x, y] = getComputedStyle(image).objectPosition.split(' ').map(parseFloat)
          const left = box.left + ((box.width - image.naturalWidth * scale) * x) / 100
          const top = box.top + ((box.height - image.naturalHeight * scale) * y) / 100
          const subject = subjects[index]
          const bounds = {
            left: left + subject.left * image.naturalWidth * scale,
            right: left + subject.right * image.naturalWidth * scale,
            top: top + subject.top * image.naturalHeight * scale,
            bottom: top + subject.bottom * image.naturalHeight * scale,
          }
          if (!wasActive) image.classList.remove('is-active')
          return bounds.left < 0 ||
            bounds.right > innerWidth ||
            bounds.top < box.top ||
            bounds.bottom > Math.min(box.bottom, copyTop)
            ? [image.getAttribute('src')]
            : []
        })
      }, subjects)
    expect(problems, `photo subjects clipped or behind text at ${viewport.width}px`).toEqual([])
  }
})

const expectHeaderContained = async (page: Page) => {
  await expect
    .poll(() =>
      page.locator('.site-header').evaluate((header) => {
        const bounds = header.getBoundingClientRect()
        const controls = Array.from(
          header.querySelectorAll('.brand, .language-toggle, .menu-toggle, .main-nav a'),
        )
          .map((element) => ({
            name: element.className || element.tagName,
            box: element.getBoundingClientRect(),
          }))
          .filter(({ box }) => box.width > 0 && box.height > 0)
        const problems: string[] = []
        for (const { name, box } of controls) {
          if (box.left < bounds.left - 1 || box.right > bounds.right + 1) {
            problems.push(`${name} extends outside the header`)
          }
        }
        for (let i = 0; i < controls.length; i++) {
          for (let j = i + 1; j < controls.length; j++) {
            const a = controls[i].box
            const b = controls[j].box
            if (
              Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
              Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
            ) {
              problems.push(`${controls[i].name} overlaps ${controls[j].name}`)
            }
          }
        }
        return problems
      }),
    )
    .toEqual([])
}

for (const language of ['es', 'en'] as const) {
  test(`maintains readable ${language} content and touch controls across phone and tablet widths`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`/${language}/int`)
    await expect(page.locator('.preloader')).toHaveCount(0)
    await page.evaluate(() => document.fonts.ready)

    for (const width of [320, 360, 390, 600, 601, 641, 768, 900, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      const layout = await page.evaluate(() => {
        const controls = Array.from(
          document.querySelectorAll(
            '.language-toggle button, .menu-toggle, .contact-facts a, .footer-contact > a',
          ),
        ).filter((node) => node.getBoundingClientRect().width > 0)
        const headings = Array.from(document.querySelectorAll<HTMLElement>('h1, h2, h3'))
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          smallTargets: controls
            .filter((node) => node.getBoundingClientRect().height < 44)
            .map((node) => node.textContent || node.className),
          serviceFont: Math.min(
            ...Array.from(document.querySelectorAll('.impilo-step-title')).map((node) =>
              parseFloat(getComputedStyle(node).fontSize),
            ),
          ),
          fieldFont: parseFloat(
            getComputedStyle(document.querySelector('.contact-form input')!).fontSize,
          ),
          overflowingHeadings: headings
            .filter((node) => node.scrollWidth > node.clientWidth + 1)
            .map((node) => node.textContent),
        }
      })
      expect(layout.overflow, `page overflow at ${width}px`).toBe(false)
      expect(layout.smallTargets, `touch targets at ${width}px`).toEqual([])
      expect(layout.serviceFont, `service hierarchy at ${width}px`).toBeGreaterThanOrEqual(32)
      expect(layout.fieldFont).toBeGreaterThanOrEqual(16)
      expect(layout.overflowingHeadings, `headings at ${width}px`).toEqual([])
    }

    await page.setViewportSize({ width: 320, height: 740 })
    const card = page.locator('.impilo-specialty-card').first()
    await card.click()
    await expect(card).toHaveAttribute('aria-expanded', 'true')
    await expect(card.locator('.impilo-specialty-card__desc')).toHaveCSS('opacity', '1')
    await expect(page.locator('.impilo-bio')).toHaveCSS('opacity', '1')
    await expect(page.locator('.impilo-certifications__cards')).toHaveCSS('opacity', '1')
  })

  test(`keeps ${language} navigation contained before and after scrolling at responsive breakpoints`, async ({
    page,
  }) => {
    test.setTimeout(90000)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`/${language}/int`)
    await expect(page.locator('.preloader')).toHaveCount(0)
    await page.evaluate(() => document.fonts.ready)

    for (const width of [320, 360, 390, 600, 640, 641, 768, 1024, 1121, 1280, 1281, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      for (const scrollY of [0, 900]) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), scrollY)
        if (scrollY) await expect(page.locator('.site-header')).toHaveClass(/is-scrolled/)
        else await expect(page.locator('.site-header')).not.toHaveClass(/is-scrolled/)
        await expectHeaderContained(page)
      }
      const menu = page.locator('.menu-toggle')
      if (await menu.isVisible()) {
        await menu.click()
        await expect(menu).toHaveAttribute('aria-expanded', 'true')
        await expectHeaderContained(page)
        await page.keyboard.press('Escape')
        await expect(menu).toHaveAttribute('aria-expanded', 'false')
      }
    }
  })

  test(`keeps the ${language} hero inside a phone screen without moving later content as it rotates`, async ({
    page,
  }) => {
    test.setTimeout(60000)
    await page.setViewportSize({ width: 320, height: 844 })
    await page.clock.install()
    await page.goto(`/${language}/int`)
    await expect(page.locator('.preloader')).toHaveCount(0)
    await page.evaluate(() => document.fonts.ready)
    await page.clock.runFor(2000)

    const readLayout = () =>
      page.evaluate(() => {
        const hero = document.querySelector('.impilo-hero')!.getBoundingClientRect()
        const media = document.querySelector('.impilo-hero__media')!.getBoundingClientRect()
        const bio = document.querySelector('.impilo-bio')!.getBoundingClientRect()
        const cta = document
          .querySelector('.impilo-hero .impilo-primary-button')!
          .getBoundingClientRect()
        const word = document.querySelector('.impilo-hero__word')!
        const range = document.createRange()
        range.selectNodeContents(word)
        return {
          heroHeight: hero.height,
          mediaTop: media.top + window.scrollY,
          bioTop: bio.top + window.scrollY,
          ctaTop: cta.top + window.scrollY,
          tagline: word.textContent,
          textFits: Array.from(range.getClientRects()).every(
            (rect) => rect.width === 0 || (rect.left >= -1 && rect.right <= window.innerWidth + 1),
          ),
        }
      })
    const initial = await readLayout()
    const images = new Set<string | null>()
    for (let frame = 0; frame < 72; frame++) {
      const layout = await readLayout()
      expect(layout.textFits).toBe(true)
      expect(layout.tagline).toBe(language === 'es' ? 'nuestra prioridad' : 'our priority')
      for (const key of ['heroHeight', 'mediaTop', 'bioTop', 'ctaTop'] as const) {
        expect(
          Math.abs(layout[key] - initial[key]),
          `${key} should remain stable`,
        ).toBeLessThanOrEqual(1)
      }
      images.add(await page.locator('.impilo-hero__media img.is-active').getAttribute('src'))
      await page.clock.runFor(250)
    }
    expect(images.size).toBe(3)
  })

  test(`wraps ${language} card titles inside their available space`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`/${language}/int`)
    await page.evaluate(() => document.fonts.ready)
    for (const width of [320, 600, 640, 641, 768]) {
      await page.setViewportSize({ width, height: 900 })
      const overflowing = await page
        .locator('.impilo-certifications__card h3, .impilo-specialty-card__title')
        .evaluateAll((titles) =>
          titles
            .filter((title) => title.scrollWidth > title.clientWidth + 1)
            .map((title) => title.textContent),
        )
      expect(overflowing, `Card titles should wrap at ${width}px`).toEqual([])
    }
  })

  test(`keeps the ${language} mobile menu usable in landscape and closes it on desktop`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 640, height: 320 })
    await page.goto(`/${language}/int`)
    await expect(page.locator('.preloader')).toHaveCount(0)
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }))
    await expect(page.locator('.site-header')).toHaveClass(/is-scrolled/)
    await page.locator('.menu-toggle').click()
    const nav = page.locator('#mobile-nav')
    await expect(nav).toBeVisible()
    await expect
      .poll(() =>
        nav.evaluate((nav) => {
          const bounds = nav.getBoundingClientRect()
          const header = document.querySelector('.site-header')!.getBoundingClientRect()
          return bounds.top >= header.bottom + 8 && bounds.bottom <= window.innerHeight - 8
        }),
      )
      .toBe(true)
    await nav.locator('a[href="#contacto"]').click()
    await expect(nav).toHaveCount(0)
    await page.locator('.menu-toggle').click()
    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(nav).toHaveCount(0)
  })
}

test('responds to reduced-motion changes without hiding content or continuing the hero rotation', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('/en/int')
  await expect(page.locator('.preloader')).toHaveCount(0)
  await page.clock.runFor(2000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.impilo-specialty-card.is-highlighted')).toHaveCount(0)
  const image = await page.locator('.impilo-hero__media img.is-active').getAttribute('src')
  await page.clock.runFor(18000)
  await expect(page.locator('.impilo-hero__media img.is-active')).toHaveAttribute('src', image!)
  await expect(page.locator('.impilo-bio')).toHaveCSS('opacity', '1')
  await expect(page.locator('.impilo-bio h2').locator('..')).toHaveCSS('opacity', '1')
  await expect(page.locator('.impilo-specialties h2').locator('..')).toHaveCSS('opacity', '1')
  for (const stat of await page.locator('.impilo-bio__stats [role="img"]').all()) {
    await expect(stat).toHaveText((await stat.getAttribute('aria-label'))!)
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.clock.runFor(6500)
  expect(await page.locator('.impilo-hero__media img.is-active').getAttribute('src')).not.toBe(
    image,
  )
})

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`contains the whole page and expanded card copy with motion: ${reducedMotion}`, async ({
    page,
  }) => {
    test.setTimeout(90000)
    await page.emulateMedia({ reducedMotion })
    for (const language of ['es', 'en']) {
      await page.goto(`/${language}/int`)
      await expect(page.locator('.preloader')).toHaveCount(0)
      for (const width of [320, 360, 768, 1024, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 })
        for (const card of await page.locator('.impilo-specialty-card').all()) {
          await card.click()
          await expect(card).toHaveAttribute('aria-expanded', 'true')
          const description = card.locator('.impilo-specialty-card__desc > span')
          await expect
            .poll(() => description.evaluate((node) => node.scrollHeight <= node.clientHeight + 1))
            .toBe(true)
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
        const clipped = await page
          .locator('.impilo-specialty-card__desc > span, .impilo-integration-product p')
          .evaluateAll((nodes) =>
            nodes
              .filter((node) => node.scrollWidth > node.clientWidth + 1)
              .map((node) => node.textContent),
          )
        expect(clipped, `${language} copy at ${width}px`).toEqual([])
        // Start the next viewport with all descriptions closed.
        await page.locator('.impilo-specialty-card.is-open').click()
      }
    }
  })

  test(`keeps every service readable on a short landscape screen with motion: ${reducedMotion}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 844, height: 390 })
    await page.emulateMedia({ reducedMotion })
    await page.goto('/es/int')
    await expect(page.locator('.impilo-home')).toHaveClass(/is-animated/)
    await expect(page.locator('.preloader')).toHaveCount(0)
    for (const step of await page.locator('.impilo-step').all()) {
      const title = step.locator('h3')
      await title.scrollIntoViewIfNeeded()
      await expect
        .poll(() =>
          title.evaluate((title) => {
            const range = document.createRange()
            range.selectNodeContents(title)
            const lines = Array.from(range.getClientRects()).filter((rect) => rect.height > 0)
            for (let node: Element | null = title; node; node = node.parentElement) {
              const style = getComputedStyle(node)
              if (Number(style.opacity) < 0.9 || style.visibility === 'hidden') return false
              if (/hidden|clip/.test(style.overflowY)) {
                const bounds = node.getBoundingClientRect()
                if (
                  lines.some((line) => line.top < bounds.top - 2 || line.bottom > bounds.bottom + 2)
                ) {
                  return false
                }
              }
            }
            return true
          }),
        )
        .toBe(true)
    }
  })
}

test('keeps WhatsApp reachable without covering phone or tablet content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/es/int')
  await expect(page.locator('.preloader')).toHaveCount(0)
  const button = page.locator('.whatsapp-float')
  for (const width of [320, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 844 })
    await page.locator('.impilo-hero .impilo-primary-button').evaluate((cta) => {
      window.scrollTo({
        top: cta.getBoundingClientRect().top + window.scrollY - (window.innerHeight - 100),
        behavior: 'instant',
      })
    })
    const overlapsCTA = await button.evaluate((button) => {
      const a = button.getBoundingClientRect()
      const b = document
        .querySelector('.impilo-hero .impilo-primary-button')!
        .getBoundingClientRect()
      return (
        Math.min(a.right, b.right) > Math.max(a.left, b.left) &&
        Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top)
      )
    })
    expect(overlapsCTA, `WhatsApp should not cover content at ${width}px`).toBe(false)
  }
  await button.scrollIntoViewIfNeeded()
  await expect(button).toBeInViewport()
  await expect(button).toHaveAttribute('href', /^https:\/\/wa\.me\//)
})
