import type { CollectionConfig } from 'payload'

import { isEditor, isAdmin } from '../access'
import { regions } from '../regions'

/**
 * One row per market. All content fields are localized (es/en) so editors
 * maintain every region in every language by hand — no auto-translation.
 */
export const Regions: CollectionConfig = {
  slug: 'regions',
  labels: {
    plural: { es: 'Regiones' },
    singular: { es: 'Región' },
  },
  admin: {
    group: { es: 'Configuración' },
    useAsTitle: 'code',
    defaultColumns: ['code', 'companyName', 'whatsappNumber', 'email', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    delete: isAdmin,
    update: isEditor,
  },
  fields: [
    {
      name: 'code',
      type: 'select',
      label: { es: 'Código' },
      required: true,
      unique: true,
      options: regions.map((region) => ({ label: region.label.es, value: region.code })),
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'companyName',
      type: 'text',
      label: { es: 'Nombre de la empresa' },
      localized: true,
    },
    {
      name: 'whatsappNumber',
      type: 'text',
      label: { es: 'Número de WhatsApp' },
      localized: true,
      admin: {
        description: {
          es: 'Incluye el código de país, sin espacios ni signos. Ejemplo: 584121234567.',
        },
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: { es: 'Teléfono' },
      localized: true,
    },
    {
      name: 'email',
      type: 'email',
      label: { es: 'Correo electrónico' },
      localized: true,
    },
    {
      name: 'address',
      type: 'textarea',
      label: { es: 'Dirección' },
      localized: true,
    },
    {
      name: 'seoTitle',
      type: 'text',
      label: { es: 'Título de SEO' },
      localized: true,
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      label: { es: 'Descripción de SEO' },
      localized: true,
    },
    {
      name: 'ogImage',
      type: 'upload',
      label: { es: 'Imagen para compartir (OG)' },
      localized: true,
      relationTo: 'media',
    },
  ],
}
