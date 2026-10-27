import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

import { chromium } from '@playwright/test'

const [expectedSha, label, origin, expectedHeading] = process.argv.slice(2)
if (!expectedSha || !['antes', 'despues'].includes(label) || !origin || !expectedHeading) {
  throw new Error('Uso: node capture.mjs SHA antes|despues URL TITULO')
}

const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
if (!sha.startsWith(expectedSha)) {
  throw new Error(`HEAD ${sha} no coincide con ${expectedSha}; no se toman capturas`)
}

const file = (name) => resolve(`docs/comparaciones/164/${label}-${name}.png`)
const browser = await chromium.launch({ channel: 'chromium' })

try {
  const context = await browser.newContext({
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  const response = await page.goto(`${origin}/es/int`, { timeout: 90000 })
  if (response?.status() !== 200) throw new Error(`Página: HTTP ${response?.status()}`)
  if ((await page.getByRole('heading', { level: 2, name: expectedHeading }).count()) !== 1) {
    throw new Error(`No se encontró el título esperado: ${expectedHeading}`)
  }

  await page.evaluate(() => document.fonts.ready)
  const loader = page.locator('.preloader')
  if (await loader.count()) await loader.waitFor({ state: 'detached', timeout: 15000 })

  // Visit all sections before the full-page capture so lazy content is painted.
  await page.evaluate(async () => {
    const height = document.documentElement.scrollHeight
    for (let y = 0; y < height; y += 650) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((done) => setTimeout(done, 90))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForTimeout(450)

  await page.locator('.impilo-hero').screenshot({ path: file('portada'), animations: 'disabled' })
  await page.screenshot({ path: file('pagina-completa'), fullPage: true, animations: 'disabled' })

  await page.locator('#certificaciones').scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)
  await page.screenshot({ path: file('certificaciones'), animations: 'disabled' })

  const renal = page.getByRole('button', { name: /Insuficiencia Renal/ })
  await renal.scrollIntoViewIfNeeded()
  await renal.click()
  await page.waitForTimeout(550)
  await page.screenshot({ path: file('renal-abierta'), animations: 'disabled' })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(350)
  await page
    .locator('.impilo-hero')
    .screenshot({ path: file('portada-movil'), animations: 'disabled' })

  console.log(
    JSON.stringify({
      sha,
      origin,
      expectedHeading,
      viewport: '1440x900, móvil 390x844',
      screenshots: [
        'portada',
        'pagina-completa',
        'certificaciones',
        'renal-abierta',
        'portada-movil',
      ].map(file),
    }),
  )
} finally {
  await browser.close()
}
