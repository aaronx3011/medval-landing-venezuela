import type { CollectionConfig } from 'payload'

import { isEditor } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    plural: { es: 'Archivos multimedia' },
    singular: { es: 'Archivo multimedia' },
  },
  admin: {
    group: { es: 'Contenido' },
    description: {
      es: 'Sube imágenes en JPG, PNG o WebP. Tamaños recomendados: imágenes grandes 1600 px de ancho, tarjetas 960 px, miniaturas 480 px.',
    },
  },
  access: {
    create: isEditor,
    delete: isEditor,
    read: () => true,
    update: isEditor,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: { es: 'Texto alternativo' },
      localized: true,
      required: true,
      admin: {
        description: { es: 'Describe la imagen para lectores de pantalla.' },
      },
    },
  ],
  upload: {
    staticDir: process.env.MEDIA_DIR || 'media',
    mimeTypes: ['image/*'],
    adminThumbnail: 'thumbnail',
    imageSizes: [
      { name: 'thumbnail', width: 480 },
      { name: 'card', width: 960 },
      { name: 'wide', width: 1600 },
    ],
  },
}
