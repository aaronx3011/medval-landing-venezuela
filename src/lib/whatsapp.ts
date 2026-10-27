import { getUIStrings } from '@/i18n/strings'
import { isLanguageCode, type LanguageCode } from '@/regions'

export const whatsappUrl = (
  number: string | null | undefined,
  language: string | LanguageCode = 'es',
  message?: string,
) => {
  const cleaned = number?.replace(/\D/g, '')
  const text =
    message ?? getUIStrings(isLanguageCode(language) ? language : 'es').whatsapp.defaultMessage

  return cleaned ? `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}` : null
}
