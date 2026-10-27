import config from '@/payload.config'

import { describe, expect, it } from 'vitest'

describe('Admin panel branding and navigation', () => {
  it('uses the Medval logo, icon and title instead of Payload branding', async () => {
    const admin = (await config).admin

    expect(admin?.components?.graphics?.Logo).toBe('@/components/admin/MedvalLogo#MedvalLogo')
    expect(admin?.components?.graphics?.Icon).toBe('@/components/admin/MedvalIcon#MedvalIcon')
    expect(admin?.meta?.titleSuffix).toBe(' · Medval Supplies')
    expect(admin?.meta?.icons).toContainEqual({
      rel: 'icon',
      type: 'image/svg+xml',
      url: '/medval-icon.svg',
    })
  })

  it('shows a Medval welcome and quick links on the dashboard and login', async () => {
    const admin = (await config).admin

    expect(admin?.components?.beforeDashboard).toContain(
      '@/components/admin/AdminDashboardIntro#AdminDashboardIntro',
    )
    expect(admin?.components?.beforeLogin).toContain(
      '@/components/admin/AdminLoginIntro#AdminLoginIntro',
    )
  })

  it('groups navigation around content, settings, forms and administration', async () => {
    const { collections, globals } = await config
    const collectionGroup = (slug: string) =>
      collections.find((collection) => collection.slug === slug)?.admin?.group
    const globalGroup = (slug: string) =>
      globals.find((global) => global.slug === slug)?.admin?.group

    expect(globalGroup('landing')).toEqual({ es: 'Contenido' })
    expect(collectionGroup('media')).toEqual({ es: 'Contenido' })
    expect(collectionGroup('catalog-items')).toEqual({ es: 'Contenido' })
    expect(globalGroup('site-settings')).toEqual({ es: 'Configuración' })
    expect(collectionGroup('regions')).toEqual({ es: 'Configuración' })
    expect(collectionGroup('quote-requests')).toEqual({ es: 'Formularios' })
    expect(collectionGroup('users')).toEqual({ es: 'Administración' })
  })
})
