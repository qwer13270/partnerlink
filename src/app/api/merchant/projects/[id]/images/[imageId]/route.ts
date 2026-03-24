import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getMerchantProjectDetail } from '@/lib/server/properties'
import { requireApiRole } from '@/lib/server/api-auth'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; imageId: string }> },
) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  const { id, imageId } = await context.params
  const project = await getMerchantProjectDetail(auth.user.id, id)
  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  const image = project.images.find((img) => img.id === imageId)
  if (!image) {
    return NextResponse.json({ error: 'Image not found.' }, { status: 404 })
  }

  const admin = getSupabaseAdminClient()

  // Delete from storage
  if (image.storagePath) {
    await admin.storage.from('property-media').remove([image.storagePath]).catch(() => null)
  }

  // Delete DB row
  const { error } = await admin.from('property_images').delete().eq('id', imageId)
  if (error) {
    return NextResponse.json({ error: `Failed to delete image: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
