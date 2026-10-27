import type { Region as RegionDoc, SiteSetting } from '@/payload-types'
import { getUIStrings } from '@/i18n/strings'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { whatsappUrl } from '@/lib/whatsapp'
import type { LanguageCode } from '@/regions'

const socialLabels: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  x: 'X',
  youtube: 'YouTube',
}

type FooterProps = {
  region: RegionDoc | null
  siteSettings: SiteSetting
  language: LanguageCode
}

export const Footer = ({ region, siteSettings, language }: FooterProps) => {
  const strings = getUIStrings(language)
  const whatsapp = whatsappUrl(region?.whatsappNumber, language)

  return (
    <footer className="site-footer">
      <div className="footer-contact">
        <p className="footer-company">{region?.companyName ?? 'Medval Supplies'}</p>
        {region?.address ? <p>{region.address}</p> : null}
        {region?.phone ? <p>{region.phone}</p> : null}
        {region?.email ? <a href={`mailto:${region.email}`}>{region.email}</a> : null}
        {whatsapp ? (
          <a href={whatsapp} rel="noopener noreferrer" target="_blank">
            WhatsApp
          </a>
        ) : null}
      </div>

      {siteSettings.socialLinks?.length ? (
        <nav aria-label={strings.social} className="footer-social">
          {siteSettings.socialLinks.map((link) => (
            <a key={link.id} href={link.url} rel="noopener noreferrer" target="_blank">
              {socialLabels[link.platform] ?? link.platform}
            </a>
          ))}
        </nav>
      ) : null}
      {region ? <WhatsAppButton region={region} language={language} /> : null}
    </footer>
  )
}
