import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  const admin = getSupabaseAdminClient()
  const { data: profile, error } = await admin
    .from('merchant_profiles')
    .select('id,user_id,application_id,email,company_name,contact_name,phone,city,status,created_at,updated_at')
    .eq('user_id', auth.user.id)
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: 'Merchant profile not found.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, profile })
}
