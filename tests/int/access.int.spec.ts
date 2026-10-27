import { describe, expect, it } from 'vitest'

import { isAdminUser, isEditorUser } from '@/access'

describe('role access', () => {
  it('allows only admins to manage users', () => {
    expect(isAdminUser({ role: 'admin' })).toBe(true)
    expect(isAdminUser({ role: 'editor' })).toBe(false)
    expect(isAdminUser(null)).toBe(false)
  })

  it('allows both roles to edit content', () => {
    expect(isEditorUser({ role: 'admin' })).toBe(true)
    expect(isEditorUser({ role: 'editor' })).toBe(true)
    expect(isEditorUser(null)).toBe(false)
  })
})
