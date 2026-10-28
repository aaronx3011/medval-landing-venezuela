import type { Payload } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { catalogSeedItems } from '@/seed/catalog'
import { importSuppliedCatalog } from '@/lib/catalogImport'
import type { PayloadRequest } from 'payload'

const createPayload = () => {
  let mediaCount = 0
  let itemCount = 0

  const payload = {
    find: vi.fn(async () => ({ docs: [] })),
    create: vi.fn(async (args: { collection: string; data: Record<string, unknown> }) => {
      if (args.collection === 'media') {
        mediaCount += 1
        return { id: `media-${mediaCount}`, ...args.data }
      }

      itemCount += 1
      return { id: `item-${itemCount}`, ...args.data }
    }),
    update: vi.fn(async () => ({})),
    logger: { info: vi.fn() },
  }

  return payload as unknown as Payload & {
    create: ReturnType<typeof vi.fn>
    find: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
}

describe('seedCatalog', () => {
  it('leaves existing edited or unpublished products and their media untouched on reruns', async () => {
    const payload = createPayload()
    payload.find.mockResolvedValue({ docs: [{ id: 'existing', published: false, name: 'Edited' }] })
    const result = await importSuppliedCatalog(payload)
    expect(result).toEqual({ created: 0, skipped: catalogSeedItems.length })
    expect(payload.create).not.toHaveBeenCalled()
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('uploads photos and upserts catalog items with localized copy', async () => {
    const payload = createPayload()

    const [first] = catalogSeedItems
    const items = [{ ...first, images: first.images.slice(0, 2) }]

    const req = { transactionID: 'migration-transaction' } as PayloadRequest
    await importSuppliedCatalog(payload, { items, req })
    for (const calls of [
      payload.find.mock.calls,
      payload.create.mock.calls,
      payload.update.mock.calls,
    ]) {
      for (const [args] of calls) expect(args.req).toBe(req)
    }

    const mediaCreates = payload.create.mock.calls.filter(
      (call) => (call[0] as { collection: string }).collection === 'media',
    )
    const itemCreates = payload.create.mock.calls.filter(
      (call) => (call[0] as { collection: string }).collection === 'catalog-items',
    )

    expect(mediaCreates).toHaveLength(2)
    expect(itemCreates).toHaveLength(1)

    for (const [args] of mediaCreates as [{ file: { data: Buffer }; data: { alt: string } }][]) {
      expect(args.file.data.length).toBeGreaterThan(0)
      expect(args.data.alt.length).toBeGreaterThan(0)
    }

    for (const [args] of itemCreates as [
      { data: Record<string, unknown> & { images: unknown[]; published: boolean } },
    ][]) {
      expect(args.data.published).toBe(true)
      expect(args.data.images.length).toBeGreaterThanOrEqual(2)
      expect(args.data.name).toBeTruthy()
      expect(args.data.activeIngredient).toBeTruthy()
      expect(args.data.description).toBeTruthy()
    }

    // Every media document gets its English alt text, and every item gets its
    // English localized copy, in addition to the Spanish create payload.
    expect(payload.update).toHaveBeenCalledTimes(mediaCreates.length + itemCreates.length)
    expect(payload.logger.info).toHaveBeenCalledOnce()
  }, 60000)
})
