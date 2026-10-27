import { validateSubmission } from '@/actions/validation'

import { describe, expect, it } from 'vitest'

const validInput = {
  name: 'María Pérez',
  email: 'maria@example.com',
  phone: '+58 412 000 0000',
  region: 've',
  service: '',
  message: 'Necesito validar equipos de mi clínica.',
  type: 'contact' as const,
}

describe('submission validation', () => {
  it('accepts a complete contact submission', () => {
    expect(validateSubmission(validInput)).toEqual({})
  })

  it('rejects short names, bad emails and short messages', () => {
    const errors = validateSubmission({
      ...validInput,
      name: 'M',
      email: 'no-es-correo',
      message: 'corto',
    })

    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name'])
  })

  it('rejects unknown regions and bad phones', () => {
    const errors = validateSubmission({ ...validInput, region: 'xx', phone: 'abc' })

    expect(errors.region).toBeDefined()
    expect(errors.phone).toBeDefined()
  })

  it('does not require a message for quote submissions', () => {
    const errors = validateSubmission({ ...validInput, type: 'quote', message: '' })

    expect(errors.message).toBeUndefined()
  })

  it('writes error messages in the language of the submission', () => {
    const spanish = validateSubmission({ ...validInput, name: 'M', language: 'es' })
    const english = validateSubmission({ ...validInput, name: 'M', language: 'en' })

    expect(spanish.name).toBe('Ingresa tu nombre completo.')
    expect(english.name).toBe('Enter your full name.')
  })
})
