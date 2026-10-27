import type { Landing as LandingGlobal, Region as RegionRow } from '@/payload-types'
import { ContactForm } from '@/components/ContactForm'
import type { LanguageCode, RegionCode } from '@/regions'
import { getUIStrings } from '@/i18n/strings'
import { Reveal } from '@/components/motion/Reveal'
import { whatsappUrl } from '@/lib/whatsapp'

type ContactProps = {
  landing: LandingGlobal
  /** Region row for this page, or null when the region has no CMS content */
  region: RegionRow | null
  regionCode: RegionCode
  language: LanguageCode
}

export const Contact = ({ landing, region, regionCode, language }: ContactProps) => {
  const strings = getUIStrings(language)
  const whatsapp = whatsappUrl(region?.whatsappNumber, language)
  // An existing CMS record can still hold the original seed copy after this release.
  const contactHeading =
    landing.contactHeading === 'Contáctanos' || landing.contactHeading === 'Contact Us'
      ? strings.sectionLabels.contacto
      : landing.contactHeading || strings.sectionLabels.contacto
  const contactBody =
    landing.contactBody ===
      'Conéctate con nosotros hoy y construyamos juntos el futuro de la salud.' ||
    landing.contactBody ===
      'Connect with us today and let’s shape the future of healthcare together.'
      ? strings.contact.lead
      : landing.contactBody
  const contactTitle = landing.contactTitle?.trim() || strings.contact.heading
  const contactTitleAccent = landing.contactTitleAccent?.trim() || strings.contact.headingAccent
  const formHeading = landing.contactFormHeading?.trim() || strings.contact.formHeading
  const formDescription = landing.contactFormDescription?.trim() || strings.contact.formDescription

  return (
    <section className="contact" id="contacto" aria-labelledby="contact-heading">
      <div className="contact-shell">
        <Reveal className="contact-intro">
          <span className="contact-eyebrow">
            <span aria-hidden="true" className="contact-plus">
              +
            </span>
            {contactHeading}
          </span>
          <h2 id="contact-heading">
            {contactTitle} <span>{contactTitleAccent}</span>
          </h2>
          <p className="contact-lead">{contactBody}</p>

          {region ? (
            <ul className="contact-facts">
              {region.email ? (
                <li className="contact-fact--email">
                  <span className="contact-fact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="5" width="18" height="14" rx="3" />
                      <path d="m4 7 8 6 8-6" />
                    </svg>
                  </span>
                  <div>
                    <span className="contact-fact-label">{strings.form.email}</span>
                    <a href={`mailto:${region.email}`}>{region.email}</a>
                  </div>
                </li>
              ) : null}
              {region.phone ? (
                <li>
                  <span className="contact-fact-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m8 3 3 5-3 2a13 13 0 0 0 6 6l2-3 5 3-1 4c-1 3-8 0-12-4S1 5 4 4z" />
                    </svg>
                  </span>
                  <div>
                    <span className="contact-fact-label">{strings.form.phone}</span>
                    <a href={`tel:${region.phone.replace(/[^+\d]/g, '')}`}>{region.phone}</a>
                  </div>
                </li>
              ) : null}
              {whatsapp ? (
                <li>
                  <span className="contact-fact-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5Z" />
                      <path d="M8 8c0 4 2 6 6 6l1-2-2-1-1 1-2-2 1-1-1-2Z" />
                    </svg>
                  </span>
                  <div>
                    <span className="contact-fact-label">{strings.contact.whatsapp}</span>
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                      {strings.whatsapp.aria}
                      <span aria-hidden="true"> ↗</span>
                    </a>
                  </div>
                </li>
              ) : null}
            </ul>
          ) : null}
          {region?.companyName ? (
            <p className="contact-company">
              {region.companyName}
              {region.address ? <span>{region.address}</span> : null}
            </p>
          ) : null}
        </Reveal>

        <Reveal className="contact-form-slot" delay={0.12}>
          <div id="formulario">
            <div className="contact-card-heading">
              <span className="contact-card-eyebrow">
                <span aria-hidden="true" />
                {strings.contact.formEyebrow}
              </span>
              <h3 id="contact-form-heading">{formHeading}</h3>
              <p>{formDescription}</p>
            </div>
            <ContactForm defaultRegion={regionCode} language={language} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
