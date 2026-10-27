import type { GlobalConfig } from 'payload'

import { isEditor } from '../access'

const tabDescription = (es: string) => ({ es })

export const Landing: GlobalConfig = {
  slug: 'landing',
  label: { es: 'Contenido de la página' },
  admin: {
    group: { es: 'Contenido' },
    description: {
      es: 'Edita los textos e imágenes de la página de inicio. Los cambios se ven en el sitio al pulsar «Publicar cambios».',
    },
    livePreview: {
      url: ({ locale }) => `/preview?global=landing&locale=${locale.code}`,
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
      type: 'tabs',
      tabs: [
        {
          label: 'Inicio',
          admin: {
            description: tabDescription(
              'Portada: titular, texto de apoyo, botón y fotos que rotan de fondo.',
            ),
          },
          fields: [
            {
              name: 'heroTitle',
              type: 'text',
              label: { es: 'Título de la portada' },
              localized: true,
              admin: {
                description: {
                  es: 'Se muestra en grande. Si lo dejas vacío, se mantiene el título actual.',
                },
              },
            },
            {
              name: 'heroAccent',
              type: 'text',
              label: { es: 'Palabra destacada' },
              localized: true,
              admin: {
                description: {
                  es: 'Se muestra dentro del contorno animado. Déjala vacía para ocultar la palabra destacada.',
                },
              },
            },
            {
              name: 'heroSubtitle',
              type: 'textarea',
              label: { es: 'Texto de apoyo' },
              localized: true,
              admin: {
                description: {
                  es: 'Párrafo breve debajo del título. Puede quedar vacío.',
                },
              },
            },
            {
              name: 'heroCtaLabel',
              type: 'text',
              label: { es: 'Texto del botón' },
              localized: true,
              admin: {
                description: {
                  es: 'Botón principal de la portada. Lleva a la sección de contacto. Si lo dejas vacío, se mantiene el actual.',
                },
              },
            },
            {
              name: 'heroSlides',
              type: 'array',
              label: { es: 'Fotos de portada' },
              labels: {
                plural: { es: 'Fotos de portada' },
                singular: { es: 'Foto de portada' },
              },
              maxRows: 5,
              admin: {
                description: {
                  es: 'Fotos que rotan detrás del titular. Si no añades ninguna, se mantienen las fotos actuales.',
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
          ],
        },
        {
          label: 'Nosotros',
          admin: {
            description: tabDescription(
              'Presentación de Medval y cifras destacadas. Las cifras se muestran en una fila.',
            ),
          },
          fields: [
            {
              name: 'bioHeading',
              type: 'text',
              label: { es: 'Título de Nosotros' },
              localized: true,
              admin: {
                description: {
                  es: 'Ejemplo: «Sobre Medval». Si lo dejas vacío, se mantiene el actual.',
                },
              },
            },
            {
              name: 'bioBody',
              type: 'textarea',
              label: { es: 'Texto de Nosotros' },
              localized: true,
              admin: {
                description: {
                  es: 'Separa los párrafos con una línea en blanco. Si lo dejas vacío, se mantiene el texto actual.',
                },
              },
            },
            {
              name: 'bioImage',
              type: 'upload',
              label: { es: 'Imagen de fondo' },
              localized: true,
              relationTo: 'media',
              admin: {
                description: {
                  es: 'Opcional. Se muestra como fondo suave detrás del texto.',
                },
              },
            },
            {
              name: 'bioStats',
              type: 'array',
              label: { es: 'Cifras destacadas' },
              labels: {
                plural: { es: 'Cifras destacadas' },
                singular: { es: 'Cifra destacada' },
              },
              localized: true,
              maxRows: 4,
              admin: {
                description: {
                  es: 'Ejemplo: «+20» con la etiqueta «Países abastecidos». Si no añades cifras, se mantienen las actuales.',
                },
              },
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  label: { es: 'Cifra' },
                  required: true,
                },
                {
                  name: 'label',
                  type: 'text',
                  label: { es: 'Etiqueta' },
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Especialidades',
          admin: {
            description: tabDescription(
              'Tarjetas de especialidades médicas. Los iconos se asignan por orden. Si no añades tarjetas, se mantienen las actuales.',
            ),
          },
          fields: [
            {
              name: 'specialtiesHeading',
              type: 'text',
              label: { es: 'Título de especialidades' },
              localized: true,
            },
            {
              name: 'specialtiesDescription',
              type: 'textarea',
              label: { es: 'Texto introductorio' },
              localized: true,
            },
            {
              name: 'specialties',
              type: 'array',
              label: { es: 'Especialidades' },
              labels: {
                plural: { es: 'Especialidades' },
                singular: { es: 'Especialidad' },
              },
              localized: true,
              maxRows: 7,
              admin: {
                description: {
                  es: 'Se muestran en el mismo orden. Hay iconos disponibles para las primeras siete tarjetas. Si no añades tarjetas, se mantienen las actuales.',
                },
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: { es: 'Título' },
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: { es: 'Descripción' },
                },
              ],
            },
          ],
        },
        {
          label: 'Productos',
          admin: {
            description: tabDescription(
              'Tarjetas de productos. Cada producto puede mostrar su foto o su icono. Si no añades productos, se mantienen los actuales.',
            ),
          },
          fields: [
            {
              name: 'productsHeading',
              type: 'textarea',
              label: { es: 'Título de productos' },
              localized: true,
              admin: {
                description: {
                  es: 'Escribe una línea por cada renglón del título. Si lo dejas vacío, se mantiene el actual.',
                },
              },
            },
            {
              name: 'productsDescription',
              type: 'textarea',
              label: { es: 'Texto introductorio' },
              localized: true,
            },
            {
              name: 'services',
              type: 'array',
              label: { es: 'Productos' },
              labels: {
                plural: { es: 'Productos' },
                singular: { es: 'Producto' },
              },
              localized: true,
              maxRows: 12,
              admin: {
                description: {
                  es: 'Se muestran como tarjetas. Si activas «Mostrar foto», se usa la imagen del producto. Si no añades productos, se mantienen los actuales.',
                },
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: { es: 'Título' },
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: { es: 'Descripción' },
                },
                {
                  name: 'image',
                  type: 'upload',
                  label: { es: 'Imagen' },
                  relationTo: 'media',
                },
                {
                  name: 'showImage',
                  type: 'checkbox',
                  label: { es: 'Mostrar foto en la tarjeta' },
                  defaultValue: false,
                  admin: {
                    description: {
                      es: 'Si está desactivado, se muestra el icono del producto.',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Servicios',
          admin: {
            description: tabDescription(
              'Pasos del servicio. Se muestran de uno en uno al hacer scroll. Si no añades pasos, se mantienen los actuales.',
            ),
          },
          fields: [
            {
              name: 'process',
              type: 'array',
              label: { es: 'Pasos del servicio' },
              labels: {
                plural: { es: 'Pasos del servicio' },
                singular: { es: 'Paso del servicio' },
              },
              localized: true,
              maxRows: 5,
              admin: {
                description: {
                  es: 'El número es opcional; si lo dejas vacío se numera automáticamente. Si no añades pasos, se mantienen los actuales.',
                },
              },
              fields: [
                {
                  name: 'number',
                  type: 'text',
                  label: { es: 'Número' },
                  admin: { description: { es: 'Ejemplo: 01.' } },
                },
                {
                  name: 'title',
                  type: 'text',
                  label: { es: 'Texto antes del destacado' },
                  admin: {
                    description: {
                      es: 'Puede quedar vacío si todo el título va destacado.',
                    },
                  },
                },
                {
                  name: 'highlight',
                  type: 'text',
                  label: { es: 'Palabras destacadas' },
                  admin: {
                    description: {
                      es: 'Parte del título que se muestra en color. Puede quedar vacía.',
                    },
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: { es: 'Descripción' },
                },
              ],
            },
          ],
        },
        {
          label: 'Certificaciones',
          admin: {
            description: tabDescription(
              'Bloque informativo de certificaciones. No inventes permisos ni sellos: usa solo información verificada. Si no añades tarjetas, se mantienen las actuales.',
            ),
          },
          fields: [
            {
              name: 'certificationsHeading',
              type: 'text',
              label: { es: 'Título de certificaciones' },
              localized: true,
            },
            {
              name: 'certificationsDescription',
              type: 'textarea',
              label: { es: 'Texto introductorio' },
              localized: true,
            },
            {
              name: 'certifications',
              type: 'array',
              label: { es: 'Tarjetas de certificaciones' },
              labels: {
                plural: { es: 'Tarjetas de certificaciones' },
                singular: { es: 'Tarjeta de certificación' },
              },
              localized: true,
              maxRows: 6,
              fields: [
                {
                  name: 'category',
                  type: 'text',
                  label: { es: 'Categoría' },
                },
                {
                  name: 'title',
                  type: 'text',
                  label: { es: 'Título' },
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: { es: 'Descripción' },
                },
              ],
            },
          ],
        },
        {
          label: 'Alianzas',
          admin: {
            description: tabDescription(
              'Marcas aliadas y forma de trabajo. Puedes sustituir los logos desde Archivos multimedia. Los campos vacíos mantienen el contenido actual.',
            ),
          },
          fields: [
            {
              name: 'alliancesEyebrow',
              type: 'text',
              label: { es: 'Etiqueta superior' },
              localized: true,
            },
            {
              name: 'alliancesHeading',
              type: 'text',
              label: { es: 'Título de alianzas' },
              localized: true,
            },
            {
              name: 'alliancesText',
              type: 'textarea',
              label: { es: 'Texto de alianzas' },
              localized: true,
            },
            {
              name: 'alliancesPartnersLabel',
              type: 'text',
              label: { es: 'Etiqueta de marcas' },
              localized: true,
            },
            {
              name: 'alliancesPartners',
              type: 'array',
              label: { es: 'Marcas aliadas' },
              labels: {
                plural: { es: 'Marcas aliadas' },
                singular: { es: 'Marca aliada' },
              },
              maxRows: 8,
              admin: {
                description: {
                  es: 'Logos que aparecen en la franja de marcas. Si no añades ninguno, se mantienen los logos actuales.',
                },
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  label: { es: 'Nombre de la marca' },
                  required: true,
                },
                {
                  name: 'logo',
                  type: 'upload',
                  label: { es: 'Logo' },
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  label: { es: 'Enlace (opcional)' },
                  admin: {
                    description: {
                      es: 'Dirección completa, por ejemplo: https://empresa.com.',
                    },
                  },
                },
              ],
            },
            {
              name: 'alliancesHowLabel',
              type: 'text',
              label: { es: 'Etiqueta de forma de trabajo' },
              localized: true,
            },
            {
              name: 'alliancesHow',
              type: 'array',
              label: { es: 'Forma de trabajo' },
              labels: {
                plural: { es: 'Puntos de trabajo' },
                singular: { es: 'Punto de trabajo' },
              },
              localized: true,
              maxRows: 6,
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  label: { es: 'Texto' },
                  required: true,
                },
              ],
            },
            {
              name: 'alliancesNote',
              type: 'textarea',
              label: { es: 'Nota al pie' },
              localized: true,
            },
          ],
        },
        {
          label: 'Cierre',
          admin: {
            description: tabDescription(
              'Llamada final a la acción, antes del contacto. Los campos vacíos mantienen el contenido actual.',
            ),
          },
          fields: [
            {
              name: 'ctaHeading',
              type: 'textarea',
              label: { es: 'Título del cierre' },
              localized: true,
            },
            {
              name: 'ctaButtonLabel',
              type: 'text',
              label: { es: 'Texto del botón' },
              localized: true,
            },
          ],
        },
        {
          label: 'Contacto',
          admin: {
            description: tabDescription(
              'Título y textos de la sección de contacto. Los datos de contacto se editan en Regiones. Los campos vacíos mantienen el contenido actual.',
            ),
          },
          fields: [
            {
              name: 'contactHeading',
              type: 'text',
              label: { es: 'Etiqueta superior' },
              localized: true,
              admin: {
                description: { es: 'Ejemplo: «Contacto».' },
              },
            },
            {
              name: 'contactBody',
              type: 'textarea',
              label: { es: 'Texto de contacto' },
              localized: true,
            },
            {
              name: 'contactTitle',
              type: 'text',
              label: { es: 'Título principal' },
              localized: true,
              admin: {
                description: {
                  es: 'Primera parte del título grande. Ejemplo: «Cuéntanos qué necesita».',
                },
              },
            },
            {
              name: 'contactTitleAccent',
              type: 'text',
              label: { es: 'Parte destacada del título' },
              localized: true,
              admin: {
                description: {
                  es: 'Parte final en color. Ejemplo: «tu institución».',
                },
              },
            },
            {
              name: 'contactFormHeading',
              type: 'text',
              label: { es: 'Título del formulario' },
              localized: true,
            },
            {
              name: 'contactFormDescription',
              type: 'textarea',
              label: { es: 'Texto del formulario' },
              localized: true,
            },
          ],
        },
      ],
    },
  ],
}
