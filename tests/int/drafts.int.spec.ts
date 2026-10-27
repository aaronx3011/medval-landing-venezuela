import config from '@/payload.config'

import { describe, expect, it } from 'vitest'

describe('drafts and live preview', () => {
  it('enables drafts and live preview on Landing and Site Settings', async () => {
    const { globals } = await config

    for (const slug of ['landing', 'site-settings']) {
      const globalConfig = globals.find((global) => global.slug === slug)
      if (!globalConfig) {
        throw new Error(`${slug} global must be registered`)
      }

      expect(globalConfig.versions?.drafts).toBeTruthy()
      expect(typeof globalConfig.admin?.livePreview?.url).toBe('function')
    }
  })
})
