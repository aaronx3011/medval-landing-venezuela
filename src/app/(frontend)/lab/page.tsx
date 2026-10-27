import type { Metadata } from 'next'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { LabPlayground } from '@/components/lab/LabPlayground'

export const metadata: Metadata = {
  title: 'Lab de animaciones · Medval',
}

const fallbackIcons = ['IconOne.svg', 'IconTwo.svg', 'IconThree.svg', 'IconFour.svg']

/** Icons traced from the specs in the root `icons/` folder, served from public. */
const listGeneratedIcons = (): string[] => {
  try {
    return readdirSync(join(process.cwd(), 'public/icons'))
      .filter((file) => file.endsWith('.svg'))
      .sort()
  } catch {
    return []
  }
}

/**
 * Inline SVG markup for every icon — CSS animates the inner paths
 * (`--i` stagger + `.icona-accent`), which an <img> can't provide.
 */
const readInlineSvgs = (): Record<string, string> => {
  const inline: Record<string, string> = {}

  try {
    for (const file of readdirSync(join(process.cwd(), 'public/icons'))) {
      if (file.endsWith('.svg')) {
        inline[file] = readFileSync(join(process.cwd(), 'public/icons', file), 'utf8')
      }
    }
  } catch {
    // fall back to flat <img> renders
  }

  return inline
}

/**
 * Lists the icon assets in `public/impilo/home/how-it-works` so newly dropped
 * SVGs show up in the lab grid without code changes (falls back to the known
 * set if the folder isn't readable, e.g. in a stripped runtime image).
 */
const listIcons = (): string[] => {
  try {
    return readdirSync(join(process.cwd(), 'public/impilo/home/how-it-works'))
      .filter((file) => /^icon/i.test(file))
      .sort()
  } catch {
    return fallbackIcons
  }
}

export default function LabPage() {
  return (
    <LabPlayground
      generatedIcons={listGeneratedIcons()}
      icons={listIcons()}
      inlineSvgs={readInlineSvgs()}
    />
  )
}
