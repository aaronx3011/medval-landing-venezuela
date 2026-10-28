// @vitest-environment node
import { access } from 'node:fs/promises'
import path from 'node:path'

import { mongooseAdapter, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-mongodb'
import { createLocalReq, getPayload } from 'payload'
import { describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { findCatalogPage } from '@/lib/catalogQuery'
import * as contentMigration from '@/migrations/20261028_160000_catalog_page_content'

const uri = process.env.CATALOG_TEST_DATABASE_URI

describe.skipIf(!uri)('catalog content migration against MongoDB', () => {
  it('imports media and bilingual products, searches all products, and preserves edits on retry', async () => {
    const url = new URL(uri!)
    if (
      !['127.0.0.1', 'localhost'].includes(url.hostname) ||
      !url.pathname.startsWith('/catalog_ci_')
    ) {
      throw new Error(
        'Catalog integration tests require a disposable localhost catalog_ci_* database',
      )
    }
    const base = await config
    const payload = await getPayload({
      key: 'catalog-ci',
      config: {
        ...base,
        secret: 'catalog-ci-only-not-a-production-secret',
        db: { ...base.db, ...mongooseAdapter({ url: uri!, prodMigrations: [] }) },
      },
    })
    try {
      await payload.db.migrate({
        migrations: [
          {
            name: 'catalog-page-content-test',
            up: (args: unknown) => contentMigration.up(args as MigrateUpArgs),
            down: (args: unknown) => contentMigration.down(args as MigrateDownArgs),
          },
        ],
      })
      const spanish = await payload.find({
        collection: 'catalog-items',
        locale: 'es',
        limit: 20,
        depth: 1,
      })
      const english = await payload.find({ collection: 'catalog-items', locale: 'en', limit: 20 })
      expect(spanish.totalDocs).toBe(4)
      expect(english.docs.find((item) => item.slug.startsWith('albumina'))?.name).toContain(
        'Human Albumin',
      )
      expect((await payload.count({ collection: 'media' })).totalDocs).toBe(12)
      for (const item of spanish.docs) {
        expect(item.images).toHaveLength(3)
        for (const { image } of item.images) {
          expect(typeof image).toBe('object')
          if (typeof image === 'object' && image.filename) {
            await access(path.join(process.env.MEDIA_DIR || 'media', image.filename))
            expect(image.sizes?.thumbnail?.url).toBeTruthy()
          }
        }
      }
      const albumin = await findCatalogPage(payload, 'es', {
        q: 'albumina humana',
        category: 'all',
        page: 1,
      })
      expect(albumin.totalDocs).toBe(1)

      // More than 100 products: pages remain bounded and later products remain reachable.
      const first = spanish.docs[0]
      for (let i = 0; i < 101; i++) {
        await payload.create({
          collection: 'catalog-items',
          locale: 'es',
          data: {
            name: `Extra ${String(i).padStart(3, '0')}`,
            slug: `extra-${i}`,
            category: 'otro',
            activeIngredient: 'Compuesto de prueba',
            description: 'Producto para prueba de paginación',
            concentration: '1 mg',
            pharmaceuticalForm: 'Solución',
            presentation: 'Frasco',
            laboratory: 'CI',
            published: true,
            images: [
              {
                image:
                  typeof first.images[0].image === 'object'
                    ? first.images[0].image.id
                    : first.images[0].image,
              },
            ],
          },
        })
      }
      const lastPage = await findCatalogPage(payload, 'es', { q: '', category: 'all', page: 9 })
      expect(lastPage.totalDocs).toBe(105)
      expect(lastPage.items).toHaveLength(9)
      expect(lastPage.totalPages).toBe(9)
      const lastProduct = await findCatalogPage(payload, 'es', {
        q: 'extra 100',
        category: 'all',
        page: 1,
      })
      expect(lastProduct.items[0]?.slug).toBe('extra-100')

      await payload.update({
        collection: 'catalog-items',
        id: first.id,
        locale: 'es',
        data: { name: 'Modificado por editor', published: false },
      })
      const req = await createLocalReq({}, payload)
      await contentMigration.up({ payload, req })
      expect(
        (await payload.findByID({ collection: 'catalog-items', id: first.id, locale: 'es' })).name,
      ).toBe('Modificado por editor')
      expect(
        (await payload.findByID({ collection: 'catalog-items', id: first.id })).published,
      ).toBe(false)
      expect((await payload.count({ collection: 'media' })).totalDocs).toBe(12)
      expect(
        (await findCatalogPage(payload, 'es', { q: 'modificado', category: 'all', page: 1 }))
          .totalDocs,
      ).toBe(0)
      expect((await payload.count({ collection: 'users' })).totalDocs).toBe(0)
      expect((await payload.count({ collection: 'regions' })).totalDocs).toBe(0)
    } finally {
      await payload.db.connection.dropDatabase()
      await payload.destroy()
    }
  }, 120000)
})
