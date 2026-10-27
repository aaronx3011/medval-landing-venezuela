import type { CollectionConfig } from 'payload'

import { isEditor } from '../access'

/**
 * Demo pharmaceutical catalog. Items are stored in MongoDB through Payload so
 * editors can add, edit and remove them from /admin without a deploy.
 */
export const CatalogItems: CollectionConfig = {
  slug: 'catalog-items',
  labels: {
    plural: { es: 'Catálogo de productos' },
    singular: { es: 'Producto del catálogo' },
  },
  admin: {
    group: { es: 'Contenido' },
    useAsTitle: 'name',
    defaultColumns: ['name', 'activeIngredient', 'category', 'published', 'updatedAt'],
    description: {
      es: 'Medicamentos y soluciones que aparecen en el catálogo público. Cada producto puede tener varias fotos y datos farmacéuticos.',
    },
  },
  access: {
    create: isEditor,
    delete: isEditor,
    // Published items are public; editors can also see drafts in the admin.
    read: ({ req: { user } }) => (user ? true : { published: { equals: true } }),
    update: isEditor,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: { es: 'Nombre comercial' },
      localized: true,
      required: true,
      admin: {
        description: {
          es: 'Ejemplo: «A.M.K. (Amikacina) 500 mg/2 mL». Es el título de la tarjeta.',
        },
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: { es: 'Identificador' },
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: {
          es: 'Identificador estable en minúsculas, sin espacios. Ejemplo: amikacina-500-mg-2-ml.',
        },
      },
    },
    {
      name: 'category',
      type: 'select',
      label: { es: 'Categoría' },
      required: true,
      options: [
        { label: { es: 'Antibióticos' }, value: 'antibiotico' },
        { label: { es: 'Analgésicos y antipiréticos' }, value: 'analgesico' },
        { label: { es: 'Derivados plasmáticos' }, value: 'derivado-plasma' },
        { label: { es: 'Diluyentes y soluciones' }, value: 'diluyente' },
        { label: { es: 'Otros' }, value: 'otro' },
      ],
      admin: {
        description: { es: 'Se usa para filtrar el catálogo en el sitio público.' },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: { es: 'Descripción' },
      localized: true,
      required: true,
      admin: {
        description: {
          es: 'Texto breve que explica qué es el producto y para qué se usa. Evita promesas o afirmaciones no verificadas.',
        },
      },
    },
    {
      name: 'activeIngredient',
      type: 'text',
      label: { es: 'Principio activo' },
      localized: true,
      required: true,
      admin: {
        description: {
          es: 'Sustancia que produce el efecto. Ejemplo: «Sulfato de amikacina equivalente a 500 mg de amikacina».',
        },
      },
    },
    {
      name: 'concentration',
      type: 'text',
      label: { es: 'Concentración' },
      required: true,
      admin: {
        description: { es: 'Ejemplo: «500 mg / 2 mL» o «20 % (200 g/L)».' },
      },
    },
    {
      name: 'pharmaceuticalForm',
      type: 'text',
      label: { es: 'Forma farmacéutica' },
      localized: true,
      required: true,
      admin: {
        description: {
          es: 'Ejemplo: «Solución inyectable» o «Solución para infusión intravenosa».',
        },
      },
    },
    {
      name: 'presentation',
      type: 'text',
      label: { es: 'Presentación' },
      localized: true,
      required: true,
      admin: {
        description: {
          es: 'Cómo se vende o se entrega. No incluyas precios; el catálogo no tiene compra.',
        },
      },
    },
    {
      name: 'laboratory',
      type: 'text',
      label: { es: 'Laboratorio fabricante' },
      required: true,
    },
    {
      name: 'registrationNumber',
      type: 'text',
      label: { es: 'Registro sanitario' },
      admin: {
        description: {
          es: 'Opcional. Copia solo el número que aparece en el empaque o en la documentación aprobada.',
        },
      },
    },
    {
      name: 'indications',
      type: 'textarea',
      label: { es: 'Indicaciones' },
      localized: true,
      admin: {
        description: {
          es: 'Opcional. Usa únicamente información aprobada del prospecto o del fabricante.',
        },
      },
    },
    {
      name: 'warnings',
      type: 'textarea',
      label: { es: 'Precauciones y advertencias' },
      localized: true,
      admin: {
        description: {
          es: 'Opcional. Incluye conservación, vía de administración y condiciones de uso.',
        },
      },
    },
    {
      name: 'keywords',
      type: 'textarea',
      label: { es: 'Palabras clave de búsqueda' },
      localized: true,
      admin: {
        description: {
          es: 'Opcional. Separa con comas los términos alternativos que deberían encontrar este producto (marcas, sinónimos, usos).',
        },
      },
    },
    {
      name: 'prescriptionRequired',
      type: 'checkbox',
      label: { es: 'Requiere prescripción médica' },
      defaultValue: true,
      admin: {
        description: {
          es: 'Se muestra como aviso informativo en el detalle del producto.',
        },
      },
    },
    {
      name: 'images',
      type: 'array',
      label: { es: 'Fotos del producto' },
      labels: {
        plural: { es: 'Fotos del producto' },
        singular: { es: 'Foto del producto' },
      },
      required: true,
      minRows: 1,
      maxRows: 8,
      admin: {
        description: {
          es: 'La primera foto se usa en la tarjeta. Añade 2 o 3 fotos por producto para mostrar el empaque y la ampolleta.',
        },
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          label: { es: 'Imagen' },
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'published',
      type: 'checkbox',
      label: { es: 'Publicado' },
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: {
          es: 'Desmárcalo para ocultar el producto del sitio sin borrarlo.',
        },
      },
    },
  ],
}
