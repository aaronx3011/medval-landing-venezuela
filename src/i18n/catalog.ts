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
  home: string
  catalogTitle: string
  categoriesHeading: string
  productsHeading: string
  filterToggle: string
  sortLabel: string
  searchPrompt: string
  helpHeading: string
  helpBody: string
  contactTeam: string
  productSheet: string
  previousImage: string
  nextImage: string
  photoCount: (count: number) => string
}

export const catalogStrings: Record<LanguageCode, CatalogStrings> = {
  es: {
    activeIngredient: 'Principio activo',
    allCategories: 'Todos',
    catalogEyebrow: 'Medval Venezuela',
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
    heading: 'Catálogo de productos',
    imageLabel: (index, total) => `Ver imagen ${index} de ${total}`,
    indications: 'Indicaciones',
    laboratory: 'Laboratorio',
    lead: 'Encuentra lo que necesitas. Explora nuestros productos y conoce su composición, presentación y detalles.',
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
    searchPlaceholder: 'Nombre o principio activo…',
    viewDetails: 'Ver detalle',
    warnings: 'Precauciones',
    home: 'Inicio',
    catalogTitle: 'Catálogo',
    categoriesHeading: 'Categorías',
    productsHeading: 'Productos',
    filterToggle: 'Filtrar productos',
    sortLabel: 'Nombre: A–Z',
    searchPrompt: '¿Qué producto estás buscando?',
    helpHeading: '¿Buscas algo en particular?',
    helpBody:
      'Nuestro equipo puede orientarte sobre nuestros productos y las presentaciones disponibles.',
    contactTeam: 'Contactar al equipo',
    productSheet: 'Ficha del producto',
    previousImage: 'Imagen anterior',
    nextImage: 'Imagen siguiente',
    photoCount: (count) => `${count} ${count === 1 ? 'foto' : 'fotos'}`,
  },
  en: {
    activeIngredient: 'Active ingredient',
    allCategories: 'All',
    catalogEyebrow: 'Medval Venezuela',
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
    heading: 'Product catalog',
    imageLabel: (index, total) => `View image ${index} of ${total}`,
    indications: 'Indications',
    laboratory: 'Manufacturer',
    lead: 'Find what you need. Explore our products and discover their composition, presentations, and details.',
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
    searchPlaceholder: 'Name or active ingredient…',
    viewDetails: 'View details',
    warnings: 'Precautions',
    home: 'Home',
    catalogTitle: 'Catalog',
    categoriesHeading: 'Categories',
    productsHeading: 'Products',
    filterToggle: 'Filter products',
    sortLabel: 'Name: A–Z',
    searchPrompt: 'What are you looking for?',
    helpHeading: 'Looking for something specific?',
    helpBody: 'Our team can help you learn more about our products and available presentations.',
    contactTeam: 'Contact our team',
    productSheet: 'Product information',
    previousImage: 'Previous image',
    nextImage: 'Next image',
    photoCount: (count) => `${count} ${count === 1 ? 'photo' : 'photos'}`,
  },
}

export const getCatalogStrings = (language: LanguageCode) => catalogStrings[language]
