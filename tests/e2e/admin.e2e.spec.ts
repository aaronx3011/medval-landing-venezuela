import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

const serverURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

test.describe('Admin Panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext({ baseURL: serverURL })
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
    if (page) await page.context().close()
  })

  test('shows Medval branding on the login screen', async () => {
    const anonymous = await page.context().browser()?.newContext()
    const loginPage = await anonymous!.newPage()

    await loginPage.goto(`${serverURL}/admin/login`)
    await expect(loginPage.locator('.medval-admin-logo__dark')).toBeVisible()
    await expect(
      loginPage.getByText('Accede para editar los textos, las fotos y la configuración'),
    ).toBeVisible()
    await anonymous!.close()
  })

  test('can navigate to dashboard', async () => {
    await page.goto(`${serverURL}/admin`)
    await expect(page).toHaveURL(`${serverURL}/admin`)
    const dashboardArtifact = page.locator('span[title="Panel de Control"]').first()
    await expect(dashboardArtifact).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Tu contenido, en un solo lugar' }),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: /Editar la página/ })).toBeVisible()
  })

  test('can open the page content editor from the dashboard quick link', async () => {
    await page.goto(`${serverURL}/admin`)
    await page.getByRole('link', { name: /Editar la página/ }).click()
    await expect(page).toHaveURL(`${serverURL}/admin/globals/landing`)
    await expect(page.getByRole('heading', { name: 'Contenido de la página' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Inicio', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Alianzas', exact: true })).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto(`${serverURL}/admin/collections/users`)
    await expect(page).toHaveURL(`${serverURL}/admin/collections/users`)
    const listViewArtifact = page.locator('h1', { hasText: 'Usuarios' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto(`${serverURL}/admin/collections/users/create`)
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="email"]')
    await expect(editViewArtifact).toBeVisible()
  })
})
