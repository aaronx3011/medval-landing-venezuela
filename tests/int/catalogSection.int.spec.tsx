import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CatalogBrowser } from '@/components/catalog/CatalogBrowser'
import type { CatalogItemView } from '@/lib/catalog'

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}))

const item = (overrides: Partial<CatalogItemView>): CatalogItemView => ({
  activeIngredient: 'Principio activo',
  category: 'otro',
  concentration: '500 mg / 2 mL',
  description: 'Descripción',
  id: '1',
  images: [{ alt: 'Foto', url: '/api/media/file/foto.jpg' }],
  indications: null,
  keywords: '',
  laboratory: 'PISA',
  name: 'Producto',
  pharmaceuticalForm: 'Solución inyectable',
  presentation: 'Caja',
  prescriptionRequired: true,
  registrationNumber: null,
  slug: 'producto',
  warnings: null,
  ...overrides,
})

const items = [
  item({
    id: '1',
    name: 'Albúmina Humana 20 %',
    activeIngredient: 'Albúmina humana',
    category: 'derivado-plasma',
    slug: 'albumina',
  }),
  item({
    id: '2',
    name: 'Agua Inyectable PISA',
    activeIngredient: 'Agua estéril',
    category: 'diluyente',
    slug: 'agua',
  }),
  item({
    id: '3',
    name: 'A.M.K. (Amikacina)',
    activeIngredient: 'Sulfato de amikacina',
    category: 'antibiotico',
    slug: 'amk',
  }),
]

afterEach(cleanup)

describe('CatalogBrowser', () => {
  it('submits search to the catalog page and preserves filters across server pages', () => {
    render(
      <CatalogBrowser
        items={items}
        language="es"
        totalDocs={137}
        totalPages={12}
        query={{ q: 'agua', category: 'diluyente', page: 2 }}
      />,
    )

    expect(screen.getAllByRole('button', { name: /Ver detalle/ })).toHaveLength(3)
    expect(screen.getByText('137 productos')).toBeTruthy()
    expect(screen.getByRole('search').getAttribute('action')).toBe('/es/int/catalogo')
    expect(screen.getByRole('search').getAttribute('method')).toBe('get')
    expect(screen.getByRole('link', { name: 'Siguiente' }).getAttribute('href')).toBe(
      '/es/int/catalogo?q=agua&category=diluyente&page=3',
    )
    expect(screen.getByRole('link', { name: 'Anterior' }).getAttribute('href')).toBe(
      '/es/int/catalogo?q=agua&category=diluyente',
    )
    expect(screen.getByRole('link', { name: 'Antibiótico' }).getAttribute('href')).toBe(
      '/es/int/catalogo?q=agua&category=antibiotico',
    )
    expect(screen.getByRole('link', { name: 'Limpiar búsqueda' }).getAttribute('href')).toBe(
      '/es/int/catalogo',
    )
  })

  it('filters by category and opens the product detail without purchase actions', () => {
    render(
      <CatalogBrowser
        items={[items[1]]}
        language="es"
        totalDocs={1}
        totalPages={1}
        query={{ q: '', category: 'diluyente', page: 1 }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Ver detalle: Agua Inyectable PISA/ }))

    expect(screen.getByRole('dialog').textContent).toContain('Agua estéril')
    expect(screen.getByRole('dialog').textContent).toContain('Requiere prescripción médica')
    expect(
      within(screen.getByRole('dialog')).queryByText(/carrito|comprar|precio|añadir/i),
    ).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar detalle' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('shows a recoverable empty search without claiming the entire catalog is empty', () => {
    render(
      <CatalogBrowser
        items={[]}
        language="en"
        totalDocs={0}
        totalPages={1}
        query={{ q: 'missing', category: 'all', page: 1 }}
      />,
    )
    expect(screen.getByText('No products found')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Clear search' }).getAttribute('href')).toBe(
      '/en/int/catalogo',
    )
  })
})
