import type { User } from '@supabase/supabase-js'

export type AppRole = 'kol' | 'merchant' | 'admin'

export function isAppRole(value: unknown): value is AppRole {
  return value === 'kol' || value === 'merchant' || value === 'admin'
}

export function isSelfSignupRole(value: unknown): value is 'kol' | 'merchant' {
  return value === 'kol' || value === 'merchant'
}

export function resolveRoleHomePath(role: AppRole) {
  if (role === 'kol') return '/kol/home'
  if (role === 'merchant') return '/merchant/home'
  return '/admin'
}

export function getRoleFromUser(user: User | null): AppRole | null {
  const role = user?.app_metadata?.role
  if (!isAppRole(role)) return null
  return role
}
