import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

/**
 * Splits the old per-country `locale` axis into a language axis (`es`/`en`)
 * and a region axis (`int`/`ve`/`us`/`co` in the `regions` collection).
 *
 * Localized fields were stored keyed by the old locale code
 * (`{ int, ve, us, co }`); they are now stored per language (`{ es, en }`).
 *
 * The migration is idempotent: documents that already carry the new keys
 * (a fresh install seeded with the new schema, or a second run) are left
 * untouched.
 */

const OLD_LOCALES = ['int', 've', 'us', 'co'] as const

type RawDoc = Record<string, unknown>

const isPlainObject = (value: unknown): value is RawDoc =>
  typeof value === 'object' &&
  value !== null &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)

const pickFirst = (values: unknown[]) =>
  values.find((value) => value !== null && value !== undefined)

/** Remap nested localized fields too; preserve BSON IDs and already-migrated values. */
const remapValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    const mapped = value.map(remapValue)
    return mapped.some((item, index) => item !== value[index]) ? mapped : value
  }
  if (!isPlainObject(value)) return value

  if (OLD_LOCALES.some((code) => Object.hasOwn(value, code))) {
    return {
      es: remapValue(pickFirst([value.es, value.int, value.ve, value.co]) ?? null),
      en: remapValue(pickFirst([value.en, value.us, value.int, value.ve, value.co]) ?? null),
    }
  }

  const mapped = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, remapValue(item)]),
  )
  return Object.keys(mapped).some((key) => mapped[key] !== value[key]) ? mapped : value
}

const remapDocument = (doc: RawDoc): RawDoc => {
  const set: RawDoc = {}

  for (const [key, value] of Object.entries(doc)) {
    if (key === '_id') continue

    const remapped = remapValue(value)

    if (remapped !== value) {
      set[key] = remapped
    }
  }

  return set
}

/** Contact/brand fields: the same value in every language. */
const DATA_FIELDS = [
  'companyName',
  'whatsappNumber',
  'phone',
  'email',
  'address',
  'ogImage',
] as const

/** SEO fields: English only carries the verbatim US copy, else falls back to Spanish. */
const SEO_FIELDS = ['seoTitle', 'seoDescription'] as const

const REMOVED_FIELDS = [...DATA_FIELDS, ...SEO_FIELDS] as const

export async function up({ payload, session }: MigrateUpArgs): Promise<void> {
  // 1. Landing global: remap every localized field's storage keys
  const landingDocs = await payload.db.globals.collection
    .find({ global: 'landing' }, { session })
    .toArray()

  for (const doc of landingDocs) {
    const set = remapDocument(doc)

    if (Object.keys(set).length > 0) {
      await payload.db.globals.collection.updateOne({ _id: doc._id }, { $set: set }, { session })
    }
  }

  // 2. Media: the localized `alt` uses the same remap
  const mediaDocs = await payload.db.collections.media.collection.find({}, { session }).toArray()

  for (const doc of mediaDocs) {
    const set = remapDocument(doc)

    if (Object.keys(set).length > 0) {
      await payload.db.collections.media.collection.updateOne(
        { _id: doc._id },
        { $set: set },
        { session },
      )
    }
  }

  // Draft reads and restored versions must use the new language keys as well.
  for (const slug of ['landing', 'media']) {
    const model = payload.db.versions[slug]
    if (!model) continue
    const versions = await model.collection.find({}, { session }).toArray()
    for (const doc of versions) {
      const version = remapValue(doc.version)
      if (version !== doc.version) {
        await model.collection.updateOne({ _id: doc._id }, { $set: { version } }, { session })
      }
    }
  }

  // 3. Site settings: one localized document becomes four `regions` rows.
  const settingsDocs = await payload.db.globals.collection
    .find({ global: 'site-settings' }, { session })
    .toArray()

  for (const settings of settingsDocs) {
    const unset: RawDoc = {}

    for (const code of OLD_LOCALES) {
      const data: RawDoc = {}

      for (const field of REMOVED_FIELDS) {
        const localized = isPlainObject(settings[field]) ? settings[field] : undefined

        if (!localized) continue

        const value = localized[code] ?? localized.int
        if (value === null || value === undefined) continue

        data[`${field}.es`] = value

        // Contact/brand values are identical in every language; SEO English
        // only carries the US copy, other regions fall back to Spanish.
        if (code === 'us' || (DATA_FIELDS as readonly string[]).includes(field)) {
          data[`${field}.en`] = value
        }
      }

      if (Object.keys(data).length > 0) {
        await payload.db.collections.regions.collection.updateOne(
          { code },
          { $setOnInsert: { code, createdAt: new Date(), updatedAt: new Date() }, $set: data },
          { session, upsert: true },
        )
      }
    }

    for (const field of REMOVED_FIELDS) {
      if (isPlainObject(settings[field])) {
        unset[field] = ''
      }
    }

    // `socialLinks` was localized per country with identical values; keep one copy.
    const socialLinks = settings.socialLinks
    if (isPlainObject(socialLinks)) {
      const links = pickFirst(OLD_LOCALES.map((code) => socialLinks[code]))

      if (links !== undefined) {
        await payload.db.globals.collection.updateOne(
          { _id: settings._id },
          { $set: { socialLinks: links } },
          { session },
        )
      }
    }

    if (Object.keys(unset).length > 0) {
      await payload.db.globals.collection.updateOne(
        { _id: settings._id },
        { $unset: unset },
        { session },
      )
    }
  }

  const settingsVersions = payload.db.versions['site-settings']
  if (settingsVersions) {
    const versions = await settingsVersions.collection.find({}, { session }).toArray()
    for (const doc of versions) {
      if (!isPlainObject(doc.version)) continue
      const version = { ...doc.version }
      for (const field of REMOVED_FIELDS) delete version[field]
      if (isPlainObject(version.socialLinks)) {
        const links = version.socialLinks
        version.socialLinks = pickFirst(OLD_LOCALES.map((code) => links[code])) ?? []
      }
      await settingsVersions.collection.updateOne(
        { _id: doc._id },
        { $set: { version } },
        { session },
      )
    }
  }

  // 4. Quote requests: `country` was the old locale axis; rename it to the
  //    region axis and leave `language` unset for historical rows.
  await payload.db.collections['quote-requests'].collection.updateMany(
    { country: { $exists: true } },
    [
      {
        $set: {
          region: { $ifNull: ['$country', null] },
          language: null,
        },
      },
      { $unset: 'country' },
    ],
    { session },
  )
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Not reversible: languages were merged from overlapping sources, so the
  // original per-country values cannot be reconstructed exactly.
}
