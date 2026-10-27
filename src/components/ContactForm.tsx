'use client'

import { useState } from 'react'

import { submitContact, type ContactFormState } from '@/actions/submitContact'
import { trackEvent } from '@/components/Analytics'
import { getUIStrings } from '@/i18n/strings'
import { resolveLanguage, type LanguageCode } from '@/regions'

type ContactFormProps = {
  defaultRegion: string
  language: LanguageCode
}

export const ContactForm = ({ defaultRegion, language }: ContactFormProps) => {
  const [state, setState] = useState<ContactFormState>({ status: 'idle' })
  const strings = getUIStrings(language)
  const currentLanguage = resolveLanguage(language)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    setState({ status: 'submitting' })

    const result = await submitContact({
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      phone: String(data.get('phone') ?? ''),
      region: String(data.get('region') ?? ''),
      message: String(data.get('message') ?? ''),
      language: currentLanguage,
      honeypot: String(data.get('website') ?? ''),
    })

    setState(result)

    if (result.status === 'success') {
      trackEvent('form_submit', {
        region: String(data.get('region') ?? defaultRegion),
        language: currentLanguage,
      })
      form.reset()
    }
  }

  const stateToMessage: Record<string, string> = {
    success: strings.form.contactSuccess,
    error: strings.form.error,
    'rate-limited': strings.form.rateLimited,
  }

  return (
    <form
      className="contact-form"
      onSubmit={onSubmit}
      aria-labelledby="contact-form-heading"
      aria-busy={state.status === 'submitting'}
    >
      <div aria-hidden="true" className="honeypot" hidden>
        <label>
          {strings.form.honeypot}
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <input name="language" type="hidden" value={currentLanguage} />
      <input name="region" type="hidden" value={defaultRegion} />

      <label className="contact-field--wide">
        <span>
          {strings.form.name}{' '}
          <span className="contact-required" aria-hidden="true">
            *
          </span>
        </span>
        <input
          name="name"
          type="text"
          required
          maxLength={200}
          autoComplete="name"
          placeholder={strings.form.namePlaceholder}
        />
        {state.status === 'error' && state.errors.name ? <em>{state.errors.name}</em> : null}
      </label>

      <label className="contact-field--wide">
        <span>
          {strings.form.email}{' '}
          <span className="contact-required" aria-hidden="true">
            *
          </span>
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={strings.form.emailPlaceholder}
        />
        {state.status === 'error' && state.errors.email ? <em>{state.errors.email}</em> : null}
      </label>

      <label className="contact-field--wide">
        <span>
          {strings.form.phone} <span className="contact-optional">({strings.form.optional})</span>
        </span>
        <input
          name="phone"
          type="tel"
          maxLength={40}
          autoComplete="tel"
          placeholder={strings.form.phonePlaceholder}
        />
        {state.status === 'error' && state.errors.phone ? <em>{state.errors.phone}</em> : null}
      </label>

      <label className="contact-field--wide">
        <span>
          {strings.form.message}{' '}
          <span className="contact-required" aria-hidden="true">
            *
          </span>
        </span>
        <textarea
          name="message"
          rows={4}
          required
          maxLength={5000}
          placeholder={strings.form.messagePlaceholder}
        />
        {state.status === 'error' && state.errors.message ? <em>{state.errors.message}</em> : null}
      </label>

      <p className="contact-form-note">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="5" y="10" width="14" height="11" rx="3" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
        </svg>
        {strings.form.privacyNote}
      </p>

      <button disabled={state.status === 'submitting'} type="submit">
        <span>
          {state.status === 'submitting' ? strings.form.sending : strings.form.sendContact}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      </button>

      {state.status === 'success' ? (
        <p className="form-success" role="alert">
          {stateToMessage.success}
        </p>
      ) : null}
      {state.status === 'error' ? (
        <p className="form-error" role="alert">
          {stateToMessage.error}
        </p>
      ) : null}
      {state.status === 'rate-limited' ? (
        <p className="form-error" role="alert">
          {stateToMessage['rate-limited']}
        </p>
      ) : null}
    </form>
  )
}
