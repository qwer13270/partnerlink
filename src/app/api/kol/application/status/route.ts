import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromUser } from '@/lib/auth'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiUser } from '@/lib/server/api-auth'

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request)
  if (!auth.ok) return auth.response

  const role = getRoleFromUser(auth.user)
  const signupRole = auth.user.user_metadata?.signup_role
  if (signupRole !== 'kol' && role !== 'kol') {
    return NextResponse.json({ error: 'Only KOL accounts can view this status.' }, { status: 403 })
  }

  const admin = getSupabaseAdminClient()
  const email = (auth.user.email ?? '').trim().toLowerCase()

  const { data: application, error } = await admin
    .from('kol_applications')
    .select('id,email,full_name,status,submitted_at,reviewed_at,rejection_reason')
    .or(`user_id.eq.${auth.user.id},email.eq.${email}`)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: `Failed to load KOL application status: ${error.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({
    ok: true,
    status: role === 'kol' ? 'approved' : application?.status ?? 'missing',
    application: application
      ? {
          id: application.id,
          email: application.email,
          fullName: application.full_name,
          submittedAt: application.submitted_at,
          reviewedAt: application.reviewed_at,
          rejectionReason: application.rejection_reason,
        }
      : null,
  })
}
