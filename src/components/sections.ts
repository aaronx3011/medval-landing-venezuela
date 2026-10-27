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
