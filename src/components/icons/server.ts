import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { HOME_ICONS } from '@/components/icons/registry'

/** Server-only: inline SVG markup per icon filename, read from public/icons. */
export const loadIcons = (): Record<string, string> => {
  const icons: Record<string, string> = {}
  for (const name of HOME_ICONS) {
    try {
      icons[name] = readFileSync(join(process.cwd(), 'public/icons', name), 'utf8')
    } catch {
      // missing file → the icon falls back to a flat <img> render
    }
  }
  return icons
}
