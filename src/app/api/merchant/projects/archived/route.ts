import { NextRequest, NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/server/api-auth'
import { listArchivedMerchantProjects } from '@/lib/server/properties'

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  try {
    const projects = await listArchivedMerchantProjects(auth.user.id)
    return NextResponse.json({ ok: true, projects })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load archived projects.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
