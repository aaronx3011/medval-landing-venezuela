// @vitest-environment node
import { randomUUID } from 'node:crypto'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { createLocalReq, getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { up } from '@/migrations/20261002_120000_language_region_split'

describe('language/region migration', () => {
  let payload: Payload
  const databaseName = `medval_migration_test_${randomUUID().replaceAll('-', '')}`

  beforeAll(async () => {
    const url = new URL(
      process.env.DATABASE_URI ||
        process.env.DATABASE_URL ||
        'mongodb://127.0.0.1:27017/medval?directConnection=true',
    )
    url.pathname = `/${databaseName}`
    const baseConfig = await config
    payload = await getPayload({
      key: databaseName,
      config: {
        ...baseConfig,
        db: { ...baseConfig.db, ...mongooseAdapter({ url: url.toString() }) },
      },
    })
  }, 30000)

  afterAll(async () => {
    if (!payload) return
    // Only the disposable database created by this suite can be dropped.
    expect(payload.db.connection.name).toBe(databaseName)
    await payload.db.connection.dropDatabase()
    await payload.destroy()
  })

  it('preserves nested content, region contacts, shared links, drafts and historical submissions; reruns safely', async () => {
    const landing = {
      homeHeading: { int: 'Inicio', us: 'Home' },
      services: {
        int: [{ title: { int: 'Calibración' }, description: { int: 'Descripción' } }],
        us: [{ title: { us: 'Calibration' }, description: { us: 'Description' } }],
      },
      galleryItems: {
        int: [{ image: { int: 'image-id' }, caption: { int: 'Galería' } }],
        us: [{ image: { us: 'image-id' }, caption: { us: 'Gallery' } }],
      },
    }
    const links = [{ platform: 'instagram', url: 'https://instagram.com/medval' }]
    await payload.db.globals.collection.insertOne({ global: 'landing', ...landing })
    await payload.db.globals.collection.insertOne({
      global: 'site-settings',
      companyName: {
        int: 'MedVal',
        ve: 'MedVal Venezuela',
        us: 'MedVal US',
        co: 'MedVal Colombia',
      },
      phone: { int: '+58000000', us: '+10000000' },
      seoTitle: { int: 'Validación', us: 'Validation' },
      socialLinks: { int: links, us: links },
    })
    await payload.db.versions.landing.collection.insertOne({ version: landing })
    await payload.db.versions['site-settings'].collection.insertOne({
      version: { socialLinks: { int: links }, companyName: { int: 'MedVal' } },
    })
    await payload.db.collections.media.collection.insertOne({ alt: { int: 'Imagen', us: 'Image' } })
    await payload.db.collections['quote-requests'].collection.insertOne({
      country: 've',
      name: 'Historical',
    })
    const req = await createLocalReq({}, payload)
    const session = await payload.db.connection.startSession()
    try {
      await session.withTransaction(async () => {
        await up({ payload, req, session })
      })
    } finally {
      await session.endSession()
    }

    const migrated = await payload.db.globals.collection.findOne({ global: 'landing' })
    expect(migrated?.homeHeading).toEqual({ es: 'Inicio', en: 'Home' })
    expect(migrated?.services.es[0].title.es).toBe('Calibración')
    expect(migrated?.services.en[0].title.en).toBe('Calibration')
    expect(migrated?.galleryItems.en[0].caption.en).toBe('Gallery')
    const draft = await payload.db.versions.landing.collection.findOne({})
    expect(draft?.version.services).toEqual(migrated?.services)
    const settings = await payload.db.globals.collection.findOne({ global: 'site-settings' })
    expect(settings?.socialLinks).toEqual(links)
    expect(settings).not.toHaveProperty('companyName')
    const settingsDraft = await payload.db.versions['site-settings'].collection.findOne({})
    expect(settingsDraft?.version.socialLinks).toEqual(links)
    expect(settingsDraft?.version).not.toHaveProperty('companyName')
    const regions = await payload.db.collections.regions.collection
      .find({})
      .sort({ code: 1 })
      .toArray()
    expect(regions.map(({ code }) => code)).toEqual(['co', 'int', 'us', 've'])
    const venezuela = regions.find(({ code }) => code === 've')
    expect(venezuela?.companyName).toEqual({ es: 'MedVal Venezuela', en: 'MedVal Venezuela' })
    expect(venezuela?.phone.es).toBe('+58000000')
    expect(venezuela?.seoTitle).toEqual({ es: 'Validación' })
    const media = await payload.db.collections.media.collection.findOne({})
    expect(media?.alt).toEqual({ es: 'Imagen', en: 'Image' })
    const submission = await payload.db.collections['quote-requests'].collection.findOne({})
    expect(submission).toMatchObject({ region: 've', language: null })
    expect(submission).not.toHaveProperty('country')

    await up({ payload, req })
    expect(
      await payload.db.collections.regions.collection.find({}).sort({ code: 1 }).toArray(),
    ).toEqual(regions)
    expect(await payload.db.globals.collection.findOne({ global: 'landing' })).toEqual(migrated)
    expect(
      (await payload.db.globals.collection.findOne({ global: 'site-settings' }))?.socialLinks,
    ).toEqual(links)
  })
})
