import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { catalogSearchText } from '../lib/catalog'
import { importSuppliedCatalog, suppliedCatalogItems } from '../lib/catalogImport'

/** One-time catalog content release; deliberately separate from the development seed. */
export async function up({ payload, req, session }: MigrateUpArgs): Promise<void> {
  await importSuppliedCatalog(payload, {
    req,
    // Three representative JPEG photos per medicine; originals remain in the repo.
    items: suppliedCatalogItems.map((item) => ({ ...item, images: item.images.slice(0, 3) })),
  })

  // Backfill normalized search for any existing editor-created products as well.
  const collection = payload.db.collections['catalog-items'].collection
  const cursor = collection.find({}, { session })
  for await (const doc of cursor) {
    const searchText: Record<string, string> = {}
    for (const language of ['es', 'en'] as const) {
      const localized = Object.fromEntries(
        Object.entries(doc).map(([key, value]) => [
          key,
          value &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          ('es' in value || 'en' in value)
            ? (value[language] ?? value.es)
            : value,
        ]),
      )
      searchText[language] = catalogSearchText(localized, language)
    }
    await collection.updateOne({ _id: doc._id }, { $set: { searchText } }, { session })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Do not delete editorial content or shared media on rollback. The old app can
  // still read these products; the next up is idempotent and preserves edits.
}
