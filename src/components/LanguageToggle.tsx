'use client'

import { useRouter } from 'next/navigation'

import { getUIStrings } from '@/i18n/strings'
import { languages, LANGUAGE_COOKIE, resolveLanguage, type LanguageCode } from '@/regions'

const rememberLanguage = (code: LanguageCode) => {
  document.cookie = `${LANGUAGE_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`
}

export const LanguageToggle = ({ current }: { current: LanguageCode }) => {
  const router = useRouter()
  const strings = getUIStrings(current)
  const language = resolveLanguage(current)

  const switchTo = (code: LanguageCode) => {
    rememberLanguage(code)

    const { pathname, search, hash } = window.location
    const segments = pathname.split('/')

    // `/{lang}/{region}` → replace only the language segment
    segments[1] = code

    router.push(`/${segments.filter(Boolean).join('/')}${search}${hash}`)
  }

  return (
    <div className="language-toggle" role="group" aria-label={strings.languageToggle}>
      {languages.map((code) => (
        <button
          key={code}
          aria-pressed={code === language}
          className={code === language ? 'is-active' : undefined}
          type="button"
          onClick={() => switchTo(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
