import type { User } from '@supabase/supabase-js'
import { getRoleFromUser } from '@/lib/auth'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export type CompleteSignupResult =
  | { ok: true; status: 'approved' | 'pending_admin_review' }
  | { ok: false; status: 'denied' }
  | { ok: false; code: 'MISSING_APPLICATION' | 'UNKNOWN_APPLICATION_STATE' | 'WRONG_SIGNUP_ROLE' }
  | { ok: false; code: 'INTERNAL'; error: string }

type Role = 'kol' | 'merchant'

const TABLE: Record<Role, 'kol_applications' | 'merchant_applications'> = {
  kol: 'kol_applications',
  merchant: 'merchant_applications',
}

export async function completeSignupForUser(
  user: User,
  role: Role,
): Promise<CompleteSignupResult> {
  if (getRoleFromUser(user) === role) {
    return { ok: true, status: 'approved' }
  }

  if (user.user_metadata?.signup_role !== role) {
    return { ok: false, code: 'WRONG_SIGNUP_ROLE' }
  }

  const admin = getSupabaseAdminClient()
  const table = TABLE[role]
  const email = (user.email ?? '').trim().toLowerCase()

  let { data: application, error: findError } = await admin
    .from(table)
    .select('id,status,user_id,email')
    .eq('user_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!findError && !application && email) {
    const fallback = await admin
      .from(table)
      .select('id,status,user_id,email')
      .eq('email', email)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    application = fallback.data
    findError = fallback.error
  }

  if (findError) {
    return { ok: false, code: 'INTERNAL', error: `Failed to load application: ${findError.message}` }
  }

  if (!application) {
    return { ok: false, code: 'MISSING_APPLICATION' }
  }

  if (application.status === 'pending_email_confirmation') {
    const { error: updateError } = await admin
      .from(table)
      .update({ user_id: user.id, email, status: 'pending_admin_review' })
      .eq('id', application.id)

    if (updateError) {
      return { ok: false, code: 'INTERNAL', error: `Failed to complete signup: ${updateError.message}` }
    }
    return { ok: true, status: 'pending_admin_review' }
  }

  if (application.status === 'pending_admin_review') {
    if (!application.user_id) {
      const { error: claimError } = await admin
        .from(table)
        .update({ user_id: user.id, email })
        .eq('id', application.id)
      if (claimError) {
        return { ok: false, code: 'INTERNAL', error: `Failed to claim application: ${claimError.message}` }
      }
    }
    return { ok: true, status: 'pending_admin_review' }
  }

  if (application.status === 'denied') {
    return { ok: false, status: 'denied' }
  }

  if (application.status === 'approved') {
    if (!getRoleFromUser(user)) {
      const { error: updateRoleError } = await admin.auth.admin.updateUserById(user.id, {
        app_metadata: { ...user.app_metadata, role },
      })
      if (updateRoleError) {
        return { ok: false, code: 'INTERNAL', error: `Failed to grant ${role} role: ${updateRoleError.message}` }
      }
    }
    return { ok: true, status: 'approved' }
  }

  return { ok: false, code: 'UNKNOWN_APPLICATION_STATE' }
}
