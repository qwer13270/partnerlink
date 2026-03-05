import { NextRequest, NextResponse } from 'next/server'
import { isSelfSignupRole } from '@/lib/auth'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiUser } from '@/lib/server/api-auth'

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request)
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => null) as { role?: unknown } | null
  if (!body || !isSelfSignupRole(body.role)) {
    return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()
  const { error: updateError } = await admin.auth.admin.updateUserById(
    auth.user.id,
    {
      app_metadata: {
        ...auth.user.app_metadata,
        role: body.role,
      },
    },
  )

  if (updateError) {
    return NextResponse.json(
      { error: `Role update failed: ${updateError.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
