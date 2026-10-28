export const sectionIds = [
  'inicio',
  'sobre-medval',
  'especialidades',
  'catalogo',
  'servicios',
  'certificaciones',
  'alianzas',
  'contacto',
] as const

export type SectionId = (typeof sectionIds)[number]

/** Catalog is a page; other menu entries target homepage sections. */
export const navigationHref = (id: SectionId, language: 'es' | 'en') =>
  id === 'catalogo' ? `/${language}/int/catalogo` : `/${language}/int#${id}`
