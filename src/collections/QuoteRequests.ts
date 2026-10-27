import type { CollectionConfig } from 'payload'

import { isAdmin, isEditor } from '../access'
import { languages, regions } from '../regions'

export const QuoteRequests: CollectionConfig = {
  slug: 'quote-requests',
  labels: {
    plural: { es: 'Solicitudes' },
    singular: { es: 'Solicitud' },
  },
  admin: {
    group: { es: 'Formularios' },
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'region', 'language', 'service', 'type', 'createdAt'],
  },
  access: {
    // The public forms (WEB-34/WEB-35) create submissions; nobody anonymous can read.
    create: () => true,
    delete: isAdmin,
    read: isEditor,
    update: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: { es: 'Nombre' },
      required: true,
      maxLength: 200,
    },
    {
      name: 'email',
      type: 'email',
      label: { es: 'Correo electrónico' },
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: { es: 'Teléfono' },
      maxLength: 40,
    },
    {
      name: 'region',
      type: 'select',
      label: { es: 'Región' },
      options: regions.map((region) => ({ label: region.label.es, value: region.code })),
      required: true,
    },
    {
      name: 'language',
      type: 'select',
      label: { es: 'Idioma' },
      options: languages.map((language) => ({
        label: language.toUpperCase(),
        value: language,
      })),
    },
    {
      name: 'service',
      type: 'text',
      label: { es: 'Servicio de interés' },
      admin: {
        description: {
          es: 'Se llena desde el formulario; el selector de servicios se alimenta del CMS (WEB-35).',
        },
      },
    },
    {
      name: 'message',
      type: 'textarea',
      label: { es: 'Mensaje' },
      maxLength: 5000,
    },
    {
      name: 'type',
      type: 'select',
      label: { es: 'Tipo' },
      defaultValue: 'contact',
      options: [
        { label: { es: 'Contacto' }, value: 'contact' },
        { label: { es: 'Cotización' }, value: 'quote' },
      ],
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      label: { es: 'Fecha' },
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [({ value }) => value ?? new Date().toISOString()],
      },
    },
  ],
  timestamps: true,
}
