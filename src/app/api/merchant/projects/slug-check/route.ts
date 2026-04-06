import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'
import { slugifyPropertyName } from '@/lib/property-template'

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  const raw = request.nextUrl.searchParams.get('slug') ?? ''
  const normalized = slugifyPropertyName(raw)

  if (!normalized || normalized === 'merchant-project') {
    return NextResponse.json({ available: false, reason: 'invalid', normalized })
  }

  const admin = getSupabaseAdminClient()
  const { data } = await admin
    .from('projects')
    .select('id')
    .eq('slug', normalized)
    .maybeSingle()

  return NextResponse.json({ available: !data, normalized })
}
