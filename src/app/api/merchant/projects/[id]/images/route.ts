import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { isPropertyImageSlot } from '@/lib/property-template'
import { getMerchantProjectDetail } from '@/lib/server/properties'
import { requireApiRole } from '@/lib/server/api-auth'

function sanitizeFileName(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

export async function POST(
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

  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 })
  }

  const sectionKey = String(formData.get('sectionKey') ?? '')
  const altText = String(formData.get('altText') ?? '')
  const sortOrderRaw = formData.get('sortOrder')
  const sortOrder = sortOrderRaw !== null ? Number(sortOrderRaw) : 0
  const file = formData.get('file')

  if (!isPropertyImageSlot(sectionKey)) {
    return NextResponse.json({ error: 'Invalid image section.' }, { status: 400 })
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file.' }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image file too large (max 10MB).' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()
  const bucket = 'property-media'
  const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() ?? '' : ''
  const safeName = sanitizeFileName(file.name || sectionKey || 'property-image')
  const suffix = extension ? `.${extension}` : ''
  const storagePath = `properties/${auth.user.id}/${id}/${sectionKey}-${crypto.randomUUID()}-${safeName}${suffix}`

  const existingImage = project.images.find((image) => image.sectionKey === sectionKey)

  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(storagePath, file, {
      upsert: false,
      contentType: file.type || undefined,
      cacheControl: '3600',
    })

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 },
    )
  }

  const { data: row, error: upsertError } = await admin
    .from('property_images')
    .upsert(
      {
        property_id: id,
        section_key: sectionKey,
        storage_bucket: bucket,
        storage_path: storagePath,
        alt_text: altText.trim() || file.name,
        sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      },
      { onConflict: 'property_id,section_key' },
    )
    .select('id,section_key,storage_bucket,storage_path,alt_text')
    .single()

  if (upsertError || !row) {
    await admin.storage.from(bucket).remove([storagePath])
    return NextResponse.json(
      { error: `Failed to save image metadata: ${upsertError?.message ?? 'Unknown error'}` },
      { status: 500 },
    )
  }

  if (existingImage?.storagePath) {
    await admin.storage.from(bucket).remove([existingImage.storagePath]).catch(() => null)
  }

  return NextResponse.json({
    ok: true,
    image: {
      id: row.id,
      sectionKey: row.section_key,
      url: admin.storage.from(bucket).getPublicUrl(row.storage_path).data.publicUrl,
      altText: row.alt_text ?? '',
      storagePath: row.storage_path,
    },
  })
}
