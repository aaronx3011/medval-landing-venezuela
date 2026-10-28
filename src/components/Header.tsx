import Image from 'next/image'

import { HeaderScrollEffect } from '@/components/HeaderScrollEffect'
import { LanguageToggle } from '@/components/LanguageToggle'
import { MobileMenu } from '@/components/MobileMenu'
import { navigationHref, sectionIds } from '@/components/sections'
import { getUIStrings } from '@/i18n/strings'
import type { LanguageCode } from '@/regions'
import type { Region as RegionDoc } from '@/payload-types'

type HeaderProps = {
  region: RegionDoc | null
  language: LanguageCode
  variant?: 'default' | 'catalog'
}

export const Header = ({ region, language, variant = 'default' }: HeaderProps) => {
  const strings = getUIStrings(language)
  const companyName = region?.companyName ?? 'Medval Supplies'

  return (
    <header className="site-header">
      <HeaderScrollEffect />

      <a className="brand" href={navigationHref('inicio', language)}>
        <Image
          src={variant === 'catalog' ? '/medval.svg' : '/medval-white.svg'}
          alt={companyName}
          width={136}
          height={48}
          priority
        />
      </a>

      <nav className="main-nav" aria-label={strings.navSections}>
        {sectionIds.map((id) => (
          <a
            className="main-nav__link"
            key={id}
            href={navigationHref(id, language)}
            aria-current={variant === 'catalog' && id === 'catalogo' ? 'page' : undefined}
          >
            {strings.sectionLabels[id]}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <div className="header-controls">
          <LanguageToggle current={language} />
        </div>
        <MobileMenu language={language} />
      </div>
    </header>
  )
}
