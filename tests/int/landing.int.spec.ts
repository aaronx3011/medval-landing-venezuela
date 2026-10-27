import config from '@/payload.config'

import { describe, expect, it } from 'vitest'

describe('Landing global config', () => {
  it('has one tab per homepage section with bounded arrays and localized fields', async () => {
    const { globals } = await config

    const landing = globals.find((global) => global.slug === 'landing')
    if (!landing) {
      throw new Error('Landing global must be registered')
    }

    const tabs = landing.fields.find((field) => field.type === 'tabs')
    if (!tabs || tabs.type !== 'tabs') {
      throw new Error('Landing must use tabs')
    }

    expect(tabs.tabs.map((tab) => tab.label)).toEqual([
      'Inicio',
      'Nosotros',
      'Especialidades',
      'Productos',
      'Servicios',
      'Certificaciones',
      'Alianzas',
      'Cierre',
      'Contacto',
    ])

    const tabField = (tabIndex: number, name: string) =>
      tabs.tabs[tabIndex].fields.find((field) => 'name' in field && field.name === name)

    const heroSlides = tabField(0, 'heroSlides')
    expect(heroSlides?.type).toBe('array')
    if (heroSlides?.type === 'array') {
      expect(heroSlides.maxRows).toBe(5)
      expect(heroSlides.localized).toBeFalsy()
    }

    const bioStats = tabField(1, 'bioStats')
    expect(bioStats?.type).toBe('array')
    if (bioStats?.type === 'array') {
      expect(bioStats.maxRows).toBe(4)
      expect(bioStats.localized).toBe(true)
    }

    const services = tabField(3, 'services')
    expect(services?.type).toBe('array')
    if (services?.type === 'array') {
      expect(services.maxRows).toBe(12)
      expect(services.localized).toBe(true)
    }

    const process = tabField(4, 'process')
    expect(process?.type).toBe('array')
    if (process?.type === 'array') {
      expect(process.maxRows).toBe(5)
      expect(process.localized).toBe(true)
    }

    const alliancesPartners = tabField(6, 'alliancesPartners')
    expect(alliancesPartners?.type).toBe('array')
    if (alliancesPartners?.type === 'array') {
      expect(alliancesPartners.maxRows).toBe(8)
      expect(alliancesPartners.localized).toBeFalsy()
    }
  })
})
