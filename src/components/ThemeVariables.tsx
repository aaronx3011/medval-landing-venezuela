import { themeVariablesCss } from '@/lib/theme'

export const ThemeVariables = ({
  theme,
}: {
  theme: Record<string, unknown> | null | undefined
}) => {
  const declarations = themeVariablesCss(theme)

  return declarations ? <style>{`:root{${declarations}}`}</style> : null
}
