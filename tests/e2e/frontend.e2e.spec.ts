import { test, expect } from '@playwright/test'
import { allPages, hreflang, pagePath } from '../../src/regions'

const siteURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
const publicOrigin = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

test.describe('Frontend', () => {
  test.use({ locale: 'es' })

  test('serves the Spanish international landing at the root', async ({ page }) => {
    await page.goto(siteURL)

    await expect(page).toHaveURL(/\/es\/int$/)
    await expect(page).toHaveTitle(/Medval/)

    const heading = page.locator('h1').first()

    await expect(heading).not.toBeEmpty()
  })

  test('redirects old country pages to the international page without showing region dropdowns', async ({
    page,
  }) => {
    await page.goto(`${siteURL}/es/ve`)

    await expect(page).toHaveURL(/\/es\/int$/)
    await expect(page.locator('select')).toHaveCount(0)
    await expect(page.locator('#formulario input[name="region"]')).toHaveValue('int')
  })

  test('redirects legacy region URLs to the language-first shape', async ({ page }) => {
    await page.goto(`${siteURL}/ve`)

    await expect(page).toHaveURL(/\/es\/int$/)
  })

  for (const { language, region } of allPages()) {
    test(`serves ${language}/${region} with matching SEO and form language`, async ({ page }) => {
      await page.goto(`${siteURL}${pagePath(language, region)}`)
      await expect(page.locator('html')).toHaveAttribute('lang', language)
      await expect(page.locator('h1').first()).not.toBeEmpty()
      await expect(page.locator('select')).toHaveCount(0)
      await expect(page.locator('#formulario input[name="region"]')).toHaveValue('int')
      await expect(page.locator('#formulario input[name="language"]')).toHaveValue(language)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `${publicOrigin}${pagePath(language, region)}`,
      )
      for (const target of allPages()) {
        await expect(
          page.locator(
            `link[rel="alternate"][hreflang="${hreflang(target.language, target.region)}"]`,
          ),
        ).toHaveAttribute('href', `${publicOrigin}${pagePath(target.language, target.region)}`)
      }
      await expect(page.locator('link[rel="alternate"]')).toHaveCount(3)
    })
  }

  test('switches language while staying international and preserving URL suffixes', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      { name: 'medval-region', value: 'us', url: siteURL },
      { name: 'medval-locale', value: 'co', url: siteURL },
    ])
    await page.goto(`${siteURL}/es/ve?campaign=test#contacto`)
    await expect(page).toHaveURL(`${siteURL}/es/int?campaign=test#contacto`)
    await page.getByRole('button', { name: 'EN', exact: true }).click()
    await expect(page).toHaveURL(`${siteURL}/en/int?campaign=test#contacto`)
    await page.goto(`${siteURL}/`)
    await expect(page).toHaveURL(`${siteURL}/en/int`)
  })

  test('submits the English contact form with a localized confirmation', async ({ page }) => {
    await page.goto(`${siteURL}/en/int`)
    const contact = page.locator('#formulario')
    await contact.getByRole('textbox', { name: 'Name', exact: true }).fill('Browser test')
    await contact
      .getByRole('textbox', { name: 'Email', exact: true })
      .fill('browser-test@example.com')
    await contact
      .getByRole('textbox', { name: 'Message', exact: true })
      .fill('Please send more information about equipment validation.')
    await contact.getByRole('button', { name: 'Send message', exact: true }).click()
    await expect(contact.getByRole('alert')).toContainText('Thank you! Your message was sent.')
  })

  test('shrinks the header once the page is scrolled', async ({ page }) => {
    await page.goto(`${siteURL}/en/int`)

    const header = page.locator('.site-header')
    const initialHeight = (await header.boundingBox())?.height ?? 0
    expect(initialHeight).toBeGreaterThan(0)

    await page.mouse.wheel(0, 900)

    await expect(header).toHaveClass(/is-scrolled/)
    await expect(header).toHaveCSS('border-radius', '999px')
    await expect
      .poll(async () => (await header.boundingBox())?.height ?? 0)
      .toBeLessThan(initialHeight)
    await expect.poll(async () => (await header.boundingBox())?.x ?? 0).toBeGreaterThan(0)
  })

  test('shows the preloader on the first load and removes it', async ({ page }) => {
    await page.goto(siteURL, { waitUntil: 'commit' })

    const preloader = page.locator('.preloader')

    await expect(preloader).toBeAttached()
    await expect(preloader).toHaveCount(0, { timeout: 8000 })
  })

  test('reveals sections on enter', async ({ page }) => {
    await page.goto(`${siteURL}/en/int`)

    await expect(page.locator('.impilo-home')).toHaveClass(/is-animated/)
    await expect(page.locator('.impilo-hero h1')).toHaveCSS('opacity', '1')

    const specialties = page.locator('.impilo-specialties__grid')
    await expect(specialties).toHaveCSS('opacity', '0')

    await specialties.scrollIntoViewIfNeeded()
    await expect(specialties).toHaveClass(/is-visible/)
    await expect(specialties).toHaveCSS('opacity', '1')
  })

  for (const language of ['es', 'en'] as const) {
    test(`connects the seven navigation links to sections in story order (${language})`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(`${siteURL}/${language}/int`)
      const ids = [
        'inicio',
        'sobre-medval',
        'especialidades',
        'servicios',
        'certificaciones',
        'alianzas',
        'contacto',
      ]
      const links = await page
        .locator('.main-nav a')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')))
      expect(links).toEqual(ids.map((id) => `#${id}`))
      const positions = await page
        .locator('main section[id]')
        .evaluateAll(
          (nodes, wanted) =>
            nodes.filter((node) => wanted.includes(node.id)).map((node) => node.id),
          ids,
        )
      expect(positions).toEqual(ids)

      await page.locator('.main-nav a[href="#servicios"]').click()
      await expect(page).toHaveURL(/#servicios$/)
      // The section no longer shows a heading; its first service step confirms the anchor.
      await expect(page.locator('#servicios .impilo-step-title').first()).toContainText(
        language === 'es' ? 'Logística' : 'Logistics',
      )

      await page.setViewportSize({ width: 360, height: 760 })
      await page.locator('.menu-toggle').click()
      await expect(page.locator('#mobile-nav a')).toHaveCount(7)
      await page.locator('#mobile-nav a[href="#especialidades"]').click()
      await expect(page).toHaveURL(/#especialidades$/)
      await expect(page.locator('#mobile-nav')).toHaveCount(0)
    })

    test(`keeps specialty details, CTAs and the honeypot usable (${language})`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(`${siteURL}/${language}/int`)
      const cards = page.locator('.impilo-specialty-card')
      await expect(cards).toHaveCount(7)
      await expect(page.locator('.impilo-specialty-card__media')).toHaveCount(0)
      const last = cards.last()
      await expect(last).toHaveAttribute('aria-expanded', 'false')
      await last.click()
      await expect(last).toHaveAttribute('aria-expanded', 'true')
      await expect(last.locator('.impilo-specialty-card__desc')).toBeVisible()
      await expect(last.locator('.impilo-specialty-card__toggle')).toHaveText(
        language === 'es' ? 'Leer menos' : 'Read less',
      )
      await expect(cards.first().locator('.impilo-specialty-card__toggle span')).toHaveCount(0)

      const buttons = await page.locator('.impilo-primary-button').allTextContents()
      expect(buttons).toEqual(
        language === 'es' ? ['Contáctanos', 'Hablemos'] : ['Get in touch', 'Let’s talk'],
      )
      await expect(page.locator('.impilo-hero__eyebrow')).toBeVisible()
      await expect(page.locator('.impilo-scroll-cue')).toHaveAttribute('href', '#productos')
      await expect(page.locator('#linea-propia')).toHaveCount(0)
      await expect(page.locator('#productos .impilo-integrations__own-brand')).toHaveCount(0)

      const services = page.locator('#servicios')
      await expect(services.locator('h2')).toHaveCount(0)
      await expect(services.locator('.impilo-step')).toHaveCount(5)

      await expect(page.locator('.impilo-certifications__card')).toHaveCount(3)
      await expect(page.locator('.honeypot')).toBeHidden()
      await expect(page.locator('.honeypot input[name="website"]')).toHaveCount(1)
      await expect(page.locator('#certificaciones')).not.toContainText(/SICSME|MPPS|BPDA|ISO/)
    })
  }

  test('keeps language switching usable without a region dropdown at responsive widths', async ({
    page,
  }) => {
    await page.goto(`${siteURL}/en/int`)
    for (const width of [320, 360, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await expect(page.locator('select')).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'EN', exact: true })).toBeVisible()
      const headerRight = await page
        .locator('.header-actions')
        .evaluate((element) => element.getBoundingClientRect().right)
      expect(headerRight).toBeLessThanOrEqual(width)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      )
    }
  })
})
