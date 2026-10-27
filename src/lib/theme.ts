export const themeFields = {
  primary: '--color-primary',
  primaryDark: '--color-primary-dark',
  secondary: '--color-secondary',
  secondaryDark: '--color-secondary-dark',
  ink: '--color-ink',
  body: '--color-body',
  surface: '--color-surface',
  surfaceAlt: '--color-surface-alt',
  border: '--color-border',
  placeholder: '--color-placeholder',
  inputBorderHover: '--color-input-border-hover',
  error: '--color-error',
  errorText: '--color-error-text',
  whatsapp: '--color-whatsapp',
  heroWordOutline: '--color-hero-word-outline',
} as const

const isHexColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)

export const themeVariablesCss = (theme: Record<string, unknown> | null | undefined) =>
  Object.entries(themeFields)
    .flatMap(([field, variable]) => {
      const value = theme?.[field]
      return isHexColor(value) ? [`${variable}: ${value};`] : []
    })
    .join('')
