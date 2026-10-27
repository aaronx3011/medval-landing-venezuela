import config from '@/payload.config'

import {
  defaultLanguage,
  defaultLanguageByRegion,
  defaultRegion,
  isLanguageCode,
  isRegionCode,
  languages,
  regions,
} from '@/regions'

import { describe, expect, it } from 'vitest'

describe('region and language model', () => {
  it('defines four regions with es and en as the content languages', () => {
    expect(regions.map((region) => region.code)).toEqual(['int', 've', 'us', 'co'])
    expect(languages).toEqual(['es', 'en'])
    expect(defaultRegion).toBe('int')
    expect(defaultLanguage).toBe('es')
  })

  it('defaults each region to the language its market speaks', () => {
    expect(defaultLanguageByRegion).toEqual({ int: 'es', ve: 'es', us: 'en', co: 'es' })
  })

  it('accepts region and language codes only for known values', () => {
    expect(isRegionCode('ve')).toBe(true)
    expect(isRegionCode('xx')).toBe(false)
    expect(isLanguageCode('en')).toBe(true)
    expect(isLanguageCode('fr')).toBe(false)
  })

  it('enables fallback to the default language in the payload config', async () => {
    const { localization } = await config

    if (!localization) {
      throw new Error('Localization must be enabled')
    }

    expect(localization.fallback).toBe(true)
    expect(localization.defaultLocale).toBe('es')
    expect(localization.locales.map((locale) => locale.code)).toEqual(['es', 'en'])
  })

  it('registers a regions collection with a unique code and localized content', async () => {
    const { collections } = await config

    const regionsCollection = collections.find((collection) => collection.slug === 'regions')
    if (!regionsCollection) {
      throw new Error('The regions collection must be registered')
    }

    const fieldNames = regionsCollection.fields.flatMap((field) =>
      'name' in field ? [field.name] : [],
    )

    for (const name of [
      'code',
      'companyName',
      'whatsappNumber',
      'phone',
      'email',
      'address',
      'seoTitle',
      'seoDescription',
      'ogImage',
    ]) {
      expect(fieldNames).toContain(name)
    }

    const code = regionsCollection.fields.find((field) => 'name' in field && field.name === 'code')
    expect(code?.type).toBe('select')
    if (code?.type === 'select') {
      expect(code.unique).toBe(true)
    }

    const contentFields = ['companyName', 'whatsappNumber', 'phone', 'email', 'seoTitle']
    for (const field of regionsCollection.fields) {
      if ('name' in field && contentFields.includes(field.name) && 'localized' in field) {
        expect(field.localized).toBe(true)
      }
    }
  })
})
