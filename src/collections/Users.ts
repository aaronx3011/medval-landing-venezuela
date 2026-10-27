import type { CollectionConfig } from 'payload'

import { canAccessAdmin, isAdmin } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: { es: 'Administración' },
    useAsTitle: 'email',
    description: {
      es: 'Solo los administradores pueden crear y editar usuarios. Los editores pueden cambiar el contenido del sitio.',
    },
  },
  auth: true,
  labels: {
    plural: { es: 'Usuarios' },
    singular: { es: 'Usuario' },
  },
  access: {
    admin: canAccessAdmin,
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    unlock: isAdmin,
    update: isAdmin,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      label: { es: 'Rol' },
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        { label: { es: 'Administrador' }, value: 'admin' },
        { label: { es: 'Editor' }, value: 'editor' },
      ],
      admin: {
        description: { es: 'Determina los permisos del usuario.' },
      },
      hooks: {
        beforeChange: [
          async ({ operation, req, value }) => {
            // Payload's first-registration route has no authenticated user.
            if (operation === 'create' && !req.user) {
              const { totalDocs } = await req.payload.count({
                collection: 'users',
                overrideAccess: true,
              })

              return totalDocs === 0 ? 'admin' : 'editor'
            }

            return value
          },
        ],
      },
    },
    {
      name: 'bootstrapLock',
      type: 'text',
      unique: true,
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          async ({ operation, req, value }) => {
            if (operation !== 'create' || req.user) return value

            const { totalDocs } = await req.payload.count({
              collection: 'users',
              overrideAccess: true,
            })

            // The sparse unique index allows only one initial registration to win.
            return totalDocs === 0 ? 'initial-admin' : value
          },
        ],
      },
    },
  ],
}
