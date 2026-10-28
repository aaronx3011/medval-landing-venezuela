import type { Payload } from 'payload'

import { importSuppliedCatalog, suppliedCatalogItems } from '../lib/catalogImport.js'

export const catalogSeedItems = suppliedCatalogItems

/** Development seed delegates only the catalog portion to the content importer. */
export const seedCatalog = (payload: Payload, items = catalogSeedItems) =>
  importSuppliedCatalog(payload, { items })
