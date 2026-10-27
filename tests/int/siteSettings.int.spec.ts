import type { Field } from 'payload'

import config from '@/payload.config'

import { describe, expect, it } from 'vitest'

const collectFieldNames = (fields: Field[]): string[] =>
  fields.flatMap((field) => {
    const own = 'name' in field ? [field.name] : []
    const nested: Field[] = []

    if ('fields' in field && Array.isArray(field.fields)) {
      nested.push(...(field.fields as Field[]))
    }

    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        nested.push(...tab.fields)
      }
    }

    return [...own, ...collectFieldNames(nested)]
  })

describe('Site Settings global config', () => {
  it('holds only shared brand values (logo + social links)', async () => {
    const { globals } = await config

    const siteSettings = globals.find((global) => global.slug === 'site-settings')
    if (!siteSettings) {
      throw new Error('Site Settings global must be registered')
    }

    const fieldNames = collectFieldNames(siteSettings.fields)

    expect(fieldNames).toEqual([
      'logo',
      'theme',
      'primary',
      'primaryDark',
      'secondary',
      'secondaryDark',
      'ink',
      'body',
      'surface',
      'surfaceAlt',
      'border',
      'placeholder',
      'inputBorderHover',
      'error',
      'errorText',
      'whatsapp',
      'heroWordOutline',
      'socialLinks',
      'platform',
      'url',
      'id',
      '_status',
      'updatedAt',
      'createdAt',
    ])

    const socialLinks = siteSettings.fields.find(
      (field) => 'name' in field && field.name === 'socialLinks',
    )
    expect(socialLinks?.type).toBe('array')
    if (socialLinks?.type === 'array') {
      expect(socialLinks.maxRows).toBe(10)
      // Shared across every page; must not be localized.
      expect(socialLinks.localized).toBeFalsy()
    }

    const logo = siteSettings.fields.find((field) => 'name' in field && field.name === 'logo')
    expect(logo && 'localized' in logo ? logo.localized : undefined).toBeFalsy()
  })
})
