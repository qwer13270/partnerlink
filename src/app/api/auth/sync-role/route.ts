import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromUser, isSelfSignupRole } from '@/lib/auth'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiUser } from '@/lib/server/api-auth'

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request)
  if (!auth.ok) return auth.response

  const existingRole = getRoleFromUser(auth.user)
  if (existingRole) {
    return NextResponse.json({ ok: true, role: existingRole })
  }

  const signupRole = auth.user.user_metadata?.signup_role
  if (!isSelfSignupRole(signupRole)) {
    return NextResponse.json(
      { error: 'No valid signup role found on account.' },
      { status: 400 },
    )
  }

  if (signupRole === 'kol') {
    return NextResponse.json(
      { code: 'KOL_ROLE_PENDING_APPROVAL' },
      { status: 403 },
    )
  }

  const admin = getSupabaseAdminClient()
  const { error } = await admin.auth.admin.updateUserById(auth.user.id, {
    app_metadata: {
      ...auth.user.app_metadata,
      role: signupRole,
    },
  })

  if (error) {
    return NextResponse.json(
      { error: `Role sync failed: ${error.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, role: signupRole })
}
