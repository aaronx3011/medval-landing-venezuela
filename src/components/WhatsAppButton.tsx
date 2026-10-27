'use client'

import { trackEvent } from '@/components/Analytics'
import { getUIStrings } from '@/i18n/strings'
import type { LanguageCode } from '@/regions'
import type { Region as RegionDoc } from '@/payload-types'
import { whatsappUrl } from '@/lib/whatsapp'

type WhatsAppButtonProps = {
  region: RegionDoc
  language: LanguageCode
  regionCode?: string
  className?: string
}

export const WhatsAppButton = ({
  region,
  language,
  regionCode,
  className,
}: WhatsAppButtonProps) => {
  const strings = getUIStrings(language)
  const url = whatsappUrl(region.whatsappNumber, language)

  if (!url) return null

  return (
    <a
      aria-label={strings.whatsapp.aria}
      className={className ? `whatsapp-float ${className}` : 'whatsapp-float'}
      href={url}
      rel="noopener noreferrer"
      target="_blank"
      onClick={() =>
        trackEvent('whatsapp_click', {
          region: regionCode ?? region.code ?? 'int',
          language,
        })
      }
    >
      <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.38-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29Z" />
      </svg>
    </a>
  )
}
