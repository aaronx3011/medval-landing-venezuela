import { expect, test, type Locator } from '@playwright/test'

const expectPainted = async (element: Locator) => {
  await expect(element).toBeVisible()
  await expect
    .poll(() =>
      element.evaluate((element) => {
        for (let node: Element | null = element; node; node = node.parentElement) {
          const style = getComputedStyle(node)
          if (Number(style.opacity) === 0 || style.visibility === 'hidden') return false
        }
        return true
      }),
    )
    .toBe(true)
}

test.describe('Content visibility before JavaScript is available', () => {
  test.use({ javaScriptEnabled: false })

  test('paints the contact section and its icons', async ({ page }) => {
    await page.goto('/es/int#contacto')
    await expectPainted(page.locator('.contact-intro'))
    await expectPainted(page.locator('.contact-form-slot'))
    for (const icon of await page.locator('.contact-fact-icon svg').all()) {
      await expectPainted(icon)
    }
    await expectPainted(page.locator('.whatsapp-float svg'))
  })

  test('paints service icons without waiting for their animation controller', async ({ page }) => {
    await page.goto('/es/int')
    const icons = page.locator('.impilo-certifications__card .icona-stage')
    await expect(icons).toHaveCount(3)
    for (const icon of await icons.all()) await expectPainted(icon)
  })
})

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test.describe(`Content visibility with motion: ${reducedMotion}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion })
    })

    test('shows contact content after jumping straight to the bottom', async ({ page }) => {
      await page.goto('/es/int')
      await expect(page.locator('.impilo-home')).toHaveClass(/is-animated/)
      await page.locator('.site-footer').scrollIntoViewIfNeeded()
      await expectPainted(page.locator('.contact-intro'))
      await expectPainted(page.locator('.contact-form-slot'))
      await expectPainted(page.locator('.whatsapp-float svg'))
    })

    test('shows one static alliance card with all partner logos', async ({ page }) => {
      await page.goto('/es/int')
      await page.locator('.impilo-allies').scrollIntoViewIfNeeded()
      await expect(page.locator('.impilo-allies article')).toHaveCount(1)
      await expect(page.locator('.impilo-allies img')).toHaveCount(3)
      for (const logo of await page.locator('.impilo-allies img').all()) {
        await expectPainted(logo)
      }
      await expect
        .poll(() =>
          page
            .locator('.impilo-allies img')
            .evaluateAll((images: HTMLImageElement[]) =>
              images.every((image) => image.complete && image.naturalWidth > 0),
            ),
        )
        .toBe(true)
    })
  })
}

test('separates the footer email and WhatsApp links', async ({ page }) => {
  await page.goto('/es/int')
  const email = await page.locator('.footer-contact a[href^="mailto:"]').boundingBox()
  const whatsapp = await page.locator('.footer-contact a[href^="https://wa.me/"]').boundingBox()
  expect(email).not.toBeNull()
  expect(whatsapp).not.toBeNull()
  expect(whatsapp!.y).toBeGreaterThanOrEqual(email!.y + email!.height)
})
