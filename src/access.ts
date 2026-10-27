import type { Access, PayloadRequest } from 'payload'

export type UserRole = 'admin' | 'editor'

type UserWithRole =
  | {
      role?: UserRole | null
    }
  | false
  | null
  | undefined

export const isAdminUser = (user: UserWithRole) =>
  typeof user === 'object' && user?.role === 'admin'

export const isEditorUser = (user: UserWithRole) =>
  typeof user === 'object' && (user?.role === 'admin' || user?.role === 'editor')

export const isAdmin: Access = ({ req: { user } }) => isAdminUser(user)

export const isEditor: Access = ({ req: { user } }) => isEditorUser(user)

export const canAccessAdmin = ({ req: { user } }: { req: PayloadRequest }) => isEditorUser(user)
