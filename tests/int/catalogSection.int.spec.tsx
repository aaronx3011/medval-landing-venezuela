import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CatalogSection } from '@/components/catalog/CatalogSection'
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

describe('CatalogSection', () => {
  it('filters as the visitor types and clears back to every item', () => {
    render(<CatalogSection items={items} language="es" />)

    expect(screen.getAllByRole('button', { name: /Ver detalle/ })).toHaveLength(3)
    expect(screen.getByText('3 productos')).toBeTruthy()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar en el catálogo' }), {
      target: { value: 'albumina' },
    })

    expect(screen.getAllByRole('button', { name: /Ver detalle/ })).toHaveLength(1)
    expect(screen.getByText('1 producto')).toBeTruthy()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar en el catálogo' }), {
      target: { value: 'no-existe' },
    })

    expect(screen.getByText('No encontramos productos')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    expect(screen.getAllByRole('button', { name: /Ver detalle/ })).toHaveLength(3)
  })

  it('filters by category and opens the product detail without purchase actions', () => {
    render(<CatalogSection items={items} language="es" />)

    fireEvent.click(screen.getByRole('button', { name: 'Diluyente' }))
    expect(screen.getAllByRole('button', { name: /Ver detalle/ })).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: /Ver detalle: Agua Inyectable PISA/ }))

    expect(screen.getByRole('dialog').textContent).toContain('Agua estéril')
    expect(screen.getByRole('dialog').textContent).toContain('Requiere prescripción médica')
    expect(
      within(screen.getByRole('dialog')).queryByText(/carrito|comprar|precio|añadir/i),
    ).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar detalle' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
