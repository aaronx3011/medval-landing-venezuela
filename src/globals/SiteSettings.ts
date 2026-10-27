import type { GlobalConfig } from 'payload'

import { isEditor } from '../access'

const validateHexColor = (value: unknown) =>
  !value ||
  (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) ||
  'Usa un color hexadecimal, por ejemplo #E97829.'

/**
 * Site-wide values shared by every page. Per-region values (company name,
 * contact details, SEO) live in the `regions` collection.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { es: 'Configuración del sitio' },
  admin: {
    group: { es: 'Configuración' },
    description: {
      es: 'Logo, colores y redes sociales del sitio. Publica los cambios para aplicarlos.',
    },
    livePreview: {
      url: () => `/preview?global=site-settings`,
    },
  },
  access: {
    read: () => true,
    update: isEditor,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      label: { es: 'Logo del sitio' },
      admin: {
        description: {
          es: 'Opcional. Se usa como imagen de marca en la vista previa y en el contenido compartido.',
        },
      },
      relationTo: 'media',
    },
    {
      name: 'theme',
      type: 'group',
      label: { es: 'Colores del tema' },
      admin: {
        description: {
          es: 'Prueba cambios de color para el sitio y el panel. Publica los cambios para aplicarlos. Los tonos, transparencias y sombras se calculan automáticamente a partir de estos valores.',
        },
      },
      fields: [
        {
          name: 'primary',
          type: 'text',
          label: { es: 'Color principal' },
          defaultValue: '#e97829',
          validate: validateHexColor,
          admin: { description: { es: 'Botones, enlaces y acentos principales.' } },
        },
        {
          name: 'primaryDark',
          type: 'text',
          label: { es: 'Color principal oscuro' },
          defaultValue: '#f5a66b',
          validate: validateHexColor,
          admin: { description: { es: 'Estado hover y degradados del color principal.' } },
        },
        {
          name: 'secondary',
          type: 'text',
          label: { es: 'Color secundario' },
          defaultValue: '#3c3a78',
          validate: validateHexColor,
          admin: { description: { es: 'Navegación, secciones destacadas y base del panel.' } },
        },
        {
          name: 'secondaryDark',
          type: 'text',
          label: { es: 'Color secundario oscuro' },
          defaultValue: '#1e1c3d',
          validate: validateHexColor,
          admin: { description: { es: 'Fondos oscuros, pie de página y modo oscuro del panel.' } },
        },
        {
          name: 'ink',
          type: 'text',
          label: { es: 'Tinta' },
          defaultValue: '#2a2854',
          validate: validateHexColor,
          admin: { description: { es: 'Texto oscuro, superposiciones y sombras.' } },
        },
        {
          name: 'body',
          type: 'text',
          label: { es: 'Texto de cuerpo' },
          defaultValue: '#6b6985',
          validate: validateHexColor,
          admin: { description: { es: 'Párrafos y texto secundario.' } },
        },
        {
          name: 'surface',
          type: 'text',
          label: { es: 'Superficie principal' },
          defaultValue: '#f8f9fa',
          validate: validateHexColor,
          admin: {
            description: { es: 'Fondos de tarjetas, controles y texto sobre fondos oscuros.' },
          },
        },
        {
          name: 'surfaceAlt',
          type: 'text',
          label: { es: 'Superficie alternativa' },
          defaultValue: '#f8f9fa',
          validate: validateHexColor,
          admin: { description: { es: 'Fondos alternos de secciones y estados hover claros.' } },
        },
        {
          name: 'border',
          type: 'text',
          label: { es: 'Borde' },
          defaultValue: '#6b6985',
          validate: validateHexColor,
          admin: { description: { es: 'Líneas divisorias, bordes de campos y tarjetas.' } },
        },
        {
          name: 'placeholder',
          type: 'text',
          label: { es: 'Marcador de posición' },
          defaultValue: '#6b6985',
          validate: validateHexColor,
          admin: { description: { es: 'Texto de ayuda dentro de campos vacíos.' } },
        },
        {
          name: 'inputBorderHover',
          type: 'text',
          label: { es: 'Borde de campo al pasar el cursor' },
          defaultValue: '#f5a66b',
          validate: validateHexColor,
          admin: {
            description: { es: 'Borde de formularios cuando el cursor está sobre el campo.' },
          },
        },
        {
          name: 'error',
          type: 'text',
          label: { es: 'Error' },
          defaultValue: '#e97829',
          validate: validateHexColor,
          admin: { description: { es: 'Acentos, bordes y fondos de estados de error.' } },
        },
        {
          name: 'errorText',
          type: 'text',
          label: { es: 'Texto de error' },
          defaultValue: '#1e1c3d',
          validate: validateHexColor,
          admin: { description: { es: 'Texto de mensajes de error sobre fondos claros.' } },
        },
        {
          name: 'whatsapp',
          type: 'text',
          label: { es: 'WhatsApp' },
          defaultValue: '#25d366',
          validate: validateHexColor,
          admin: { description: { es: 'Botón flotante de WhatsApp.' } },
        },
        {
          name: 'heroWordOutline',
          type: 'text',
          label: { es: 'Contorno de palabra destacada' },
          defaultValue: '#f5a66b',
          validate: validateHexColor,
          admin: {
            description: { es: 'Contorno punteado de la palabra destacada en el encabezado.' },
          },
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: { es: 'Redes sociales' },
      maxRows: 10,
      fields: [
        {
          name: 'platform',
          type: 'select',
          label: { es: 'Red social' },
          options: [
            { label: { es: 'Instagram' }, value: 'instagram' },
            { label: { es: 'Facebook' }, value: 'facebook' },
            { label: { es: 'LinkedIn' }, value: 'linkedin' },
            { label: { es: 'X (Twitter)' }, value: 'x' },
            { label: { es: 'YouTube' }, value: 'youtube' },
            { label: { es: 'TikTok' }, value: 'tiktok' },
          ],
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          label: { es: 'Enlace' },
          required: true,
          admin: {
            description: { es: 'Dirección completa, por ejemplo: https://instagram.com/medval.' },
          },
        },
      ],
    },
  ],
}
