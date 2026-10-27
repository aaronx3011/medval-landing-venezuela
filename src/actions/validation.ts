import { getUIStrings, type UIStrings } from '@/i18n/strings'
import { isRegionCode, regions, type LanguageCode, type RegionCode } from '@/regions'

export type SubmissionInput = {
  name: string
  email: string
  phone: string
  region: string
  service: string
  message: string
  type: 'contact' | 'quote'
  language?: LanguageCode
}

export type FieldErrors = Partial<Record<keyof SubmissionInput, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const limits = {
  name: 200,
  phone: 40,
  message: 5000,
} as const

export const validateSubmission = (
  input: SubmissionInput,
  regionCodes: string[] = regions.map((region) => region.code),
): FieldErrors => {
  const strings: UIStrings = getUIStrings(input.language ?? 'es')
  const errors: FieldErrors = {}

  if (input.name.trim().length < 2 || input.name.trim().length > limits.name) {
    errors.name = strings.validation.name
  }

  if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = strings.validation.email
  }

  if (
    input.phone &&
    (!/^[+\d][\d\s()-]{5,}$/.test(input.phone.trim()) || input.phone.length > limits.phone)
  ) {
    errors.phone = strings.validation.phone
  }

  if (!regionCodes.includes(input.region)) {
    errors.region = strings.validation.region
  }

  if (
    input.type === 'contact' &&
    (input.message.trim().length < 10 || input.message.length > limits.message)
  ) {
    errors.message = strings.validation.message
  }

  return errors
}

export const isRegionCodeInput = (value: string): value is RegionCode => isRegionCode(value)
