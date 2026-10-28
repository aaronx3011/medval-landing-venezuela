import type { LanguageCode } from '@/regions'

export type CatalogStrings = {
  activeIngredient: string
  allCategories: string
  catalogEyebrow: string
  clearFilters: string
  clearSearch: string
  close: string
  concentration: string
  description: string
  details: string
  emptyBody: string
  emptyTitle: string
  filterLabel: string
  form: string
  heading: string
  imageLabel: (index: number, total: number) => string
  indications: string
  laboratory: string
  lead: string
  noResultsBody: string
  noResultsTitle: string
  presentation: string
  prescriptionNote: string
  registration: string
  results: (count: number) => string
  searchLabel: string
  searchButton: string
  pagination: string
  previous: string
  next: string
  pageLabel: (page: number, total: number) => string
  searchPlaceholder: string
  viewDetails: string
  warnings: string
}

export const catalogStrings: Record<LanguageCode, CatalogStrings> = {
  es: {
    activeIngredient: 'Principio activo',
    allCategories: 'Todos',
    catalogEyebrow: 'Catálogo informativo',
    clearFilters: 'Limpiar búsqueda',
    clearSearch: 'Borrar búsqueda',
    close: 'Cerrar detalle',
    concentration: 'Concentración',
    description: 'Descripción',
    details: 'Ver detalle',
    emptyBody: 'Cuando se publique un producto aparecerá aquí.',
    emptyTitle: 'El catálogo estará disponible pronto',
    filterLabel: 'Filtrar por categoría',
    form: 'Forma farmacéutica',
    heading: 'Encuentra el producto que necesitas',
    imageLabel: (index, total) => `Ver imagen ${index} de ${total}`,
    indications: 'Indicaciones',
    laboratory: 'Laboratorio',
    lead: 'Busca por nombre, principio activo o categoría. Consulta la ficha de cada producto sin comprar ni añadir al carrito.',
    noResultsBody: 'Prueba con otro nombre, principio activo o categoría.',
    noResultsTitle: 'No encontramos productos',
    presentation: 'Presentación',
    prescriptionNote: 'Producto de uso institucional. Requiere prescripción médica.',
    registration: 'Registro sanitario',
    results: (count) => (count === 1 ? '1 producto' : `${count} productos`),
    searchLabel: 'Buscar en el catálogo',
    searchButton: 'Buscar',
    pagination: 'Páginas del catálogo',
    previous: 'Anterior',
    next: 'Siguiente',
    pageLabel: (page, total) => `Página ${page} de ${total}`,
    searchPlaceholder: 'Buscar por nombre, principio activo o categoría…',
    viewDetails: 'Ver detalle',
    warnings: 'Precauciones',
  },
  en: {
    activeIngredient: 'Active ingredient',
    allCategories: 'All',
    catalogEyebrow: 'Information catalog',
    clearFilters: 'Clear search',
    clearSearch: 'Clear search',
    close: 'Close details',
    concentration: 'Concentration',
    description: 'Description',
    details: 'View details',
    emptyBody: 'Published products will appear here.',
    emptyTitle: 'The catalog is coming soon',
    filterLabel: 'Filter by category',
    form: 'Pharmaceutical form',
    heading: 'Find the product you need',
    imageLabel: (index, total) => `View image ${index} of ${total}`,
    indications: 'Indications',
    laboratory: 'Manufacturer',
    lead: 'Search by name, active ingredient, or category. Read each product page without buying or adding to a cart.',
    noResultsBody: 'Try another name, active ingredient, or category.',
    noResultsTitle: 'No products found',
    presentation: 'Presentation',
    prescriptionNote: 'Institutional-use product. Requires a medical prescription.',
    registration: 'Sanitary registration',
    results: (count) => (count === 1 ? '1 product' : `${count} products`),
    searchLabel: 'Search the catalog',
    searchButton: 'Search',
    pagination: 'Catalog pages',
    previous: 'Previous',
    next: 'Next',
    pageLabel: (page, total) => `Page ${page} of ${total}`,
    searchPlaceholder: 'Search by name, active ingredient, or category…',
    viewDetails: 'View details',
    warnings: 'Precautions',
  },
}

export const getCatalogStrings = (language: LanguageCode) => catalogStrings[language]
