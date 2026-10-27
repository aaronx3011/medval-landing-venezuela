'use server'

import { getPayload } from 'payload'
import { headers } from 'next/headers'

import config from '@/payload.config'
import { defaultLanguage, defaultRegion, isLanguageCode } from '@/regions'
import { checkRateLimit } from '@/actions/rateLimit'
import { isRegionCodeInput, validateSubmission, type FieldErrors } from '@/actions/validation'

export type ContactFormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'rate-limited' }
  | { status: 'error'; errors: FieldErrors }

const RATE_LIMIT = 5
const RATE_WINDOW_MS = 10 * 60 * 1000

type ContactFormData = {
  name: string
  email: string
  phone: string
  region: string
  message: string
  language: string
  honeypot: string
}

export const submitContact = async (data: ContactFormData): Promise<ContactFormState> => {
  if (data.honeypot) {
    return { status: 'success' }
  }

  const requestHeaders = await headers()
  const ip = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (!checkRateLimit(`contact:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return { status: 'rate-limited' }
  }

  const region = isRegionCodeInput(data.region) ? data.region : defaultRegion
  const language = isLanguageCode(data.language) ? data.language : defaultLanguage

  const errors = validateSubmission({
    name: data.name,
    email: data.email,
    phone: data.phone,
    region: data.region,
    service: '',
    message: data.message,
    type: 'contact',
    language,
  })

  if (Object.keys(errors).length > 0) {
    return { status: 'error', errors }
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  await payload.create({
    collection: 'quote-requests',
    data: {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      region,
      language,
      message: data.message.trim(),
      type: 'contact',
    },
  })

  return { status: 'success' }
}
