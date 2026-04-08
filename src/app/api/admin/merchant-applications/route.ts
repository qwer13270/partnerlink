import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['admin'])
  if (!auth.ok) return auth.response

  const searchParams = request.nextUrl.searchParams
  const statusParam = searchParams.get('status')
  const status = statusParam === 'denied' ? 'denied' : 'pending_admin_review'
  const queryText = searchParams.get('q')?.trim() ?? ''

  const admin = getSupabaseAdminClient()
  let query = admin
    .from('merchant_applications')
    .select([
      'id',
      'user_id',
      'email',
      'company_name',
      'contact_name',
      'phone',
      'city',
      'project_count',
      'submitted_at',
      'reviewed_at',
      'rejection_reason',
      'status',
      'created_at',
      'merchant_type',
    ].join(','))
    .eq('status', status)
    .order('submitted_at', { ascending: true })

  if (queryText) {
    const escaped = queryText.replace(/[%_,]/g, (token) => `\\${token}`)
    query = query.or(`company_name.ilike.%${escaped}%,email.ilike.%${escaped}%,contact_name.ilike.%${escaped}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json(
      { error: `Failed to load merchant applications: ${error.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, applications: data ?? [] })
}
