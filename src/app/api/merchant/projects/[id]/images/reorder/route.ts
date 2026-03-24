import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getMerchantProjectDetail } from '@/lib/server/properties'
import { requireApiRole } from '@/lib/server/api-auth'

type ReorderBody = {
  reorders: Array<{ id: string; sortOrder: number }>
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  const { id } = await context.params
  const project = await getMerchantProjectDetail(auth.user.id, id)
  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  const body = (await request.json().catch(() => ({}))) as ReorderBody
  if (!Array.isArray(body.reorders) || body.reorders.length === 0) {
    return NextResponse.json({ error: 'Missing reorders array.' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()
  const projectImageIds = new Set(project.images.map((img) => img.id))

  // Only update images that belong to this project
  const validReorders = body.reorders.filter((r) => projectImageIds.has(r.id))

  await Promise.all(
    validReorders.map(({ id: imageId, sortOrder }) =>
      admin
        .from('property_images')
        .update({ sort_order: sortOrder })
        .eq('id', imageId),
    ),
  )

  return NextResponse.json({ ok: true })
}
