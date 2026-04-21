import { NextRequest, NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/server/api-auth'
import { completeSignupForUser } from '@/lib/server/complete-signup'

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request)
  if (!auth.ok) return auth.response

  const result = await completeSignupForUser(auth.user, 'kol')

  if (result.ok) {
    return NextResponse.json({ ok: true, status: result.status })
  }

  if ('status' in result && result.status === 'denied') {
    return NextResponse.json({ ok: false, status: 'denied' as const }, { status: 403 })
  }

  if (result.code === 'WRONG_SIGNUP_ROLE') {
    return NextResponse.json({ error: 'Not a KOL signup account.' }, { status: 403 })
  }
  if (result.code === 'MISSING_APPLICATION') {
    return NextResponse.json({ ok: false, code: 'MISSING_APPLICATION' }, { status: 404 })
  }
  if (result.code === 'UNKNOWN_APPLICATION_STATE') {
    return NextResponse.json({ ok: false, code: 'UNKNOWN_APPLICATION_STATE' }, { status: 409 })
  }
  if (result.code === 'INTERNAL') {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
}
