import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  createDefaultPropertyModules,
  isEnglishSlug,
  parsePublishStatus,
  type PropertyContentItem,
  type PropertyModule,
} from '@/lib/property-template'
import { getMerchantProjectDetail, toMerchantProjectDetail } from '@/lib/server/properties'
import { requireApiRole } from '@/lib/server/api-auth'

type ProjectPatchBody = {
  project?: {
    slug?: string
    name?: string
    subtitle?: string
    districtLabel?: string
    completionBadge?: string
    overviewTitle?: string
    overviewBody?: string
    featuresTitle?: string
    progressTitle?: string
    progressCompletionText?: string
    locationTitle?: string
    contactTitle?: string
    contactBody?: string
    salesPhone?: string
    footerDisclaimer?: string
    mapLat?: number | string | null
    mapLng?: number | string | null
    mapZoom?: number | string | null
    publishStatus?: string
  }
  contentItems?: PropertyContentItem[]
  modules?: PropertyModule[]
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  const { id } = await context.params

  try {
    const project = await getMerchantProjectDetail(auth.user.id, id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, project })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load project.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  const { id } = await context.params
  const existing = await getMerchantProjectDetail(auth.user.id, id)
  if (!existing) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  const body = (await request.json().catch(() => ({}))) as ProjectPatchBody
  const project = body.project ?? {}
  const contentItems = Array.isArray(body.contentItems) ? body.contentItems : existing.contentItems
  const modules = Array.isArray(body.modules) ? body.modules : existing.modules
  const rawSlug = typeof project.slug === 'string' ? project.slug.trim() : ''

  if (rawSlug && !isEnglishSlug(rawSlug)) {
    return NextResponse.json(
      { error: 'Slug must use English letters, numbers, and hyphens only.' },
      { status: 400 },
    )
  }

  const nextName = normalizeString(project.name, existing.name)
  const slugCandidate = rawSlug || existing.slug
  const slug = await ensureUniqueSlug(slugCandidate, id)
  const publishStatus = parsePublishStatus(project.publishStatus)
  const publishedAt =
    publishStatus === 'published'
      ? existing.publishStatus === 'published'
        ? new Date(existing.updatedAt).toISOString()
        : new Date().toISOString()
      : null

  const admin = getSupabaseAdminClient()
  const { data: updatedProperty, error: propertyError } = await admin
    .from('properties')
    .update({
      slug,
      name: nextName,
      subtitle: normalizeNullable(project.subtitle, existing.subtitle),
      district_label: normalizeNullable(project.districtLabel, existing.districtLabel),
      completion_badge: normalizeNullable(project.completionBadge, existing.completionBadge),
      overview_title: normalizeNullable(project.overviewTitle, existing.overviewTitle),
      overview_body: normalizeNullable(project.overviewBody, existing.overviewBody),
      features_title: normalizeNullable(project.featuresTitle, existing.featuresTitle),
      progress_title: normalizeNullable(project.progressTitle, existing.progressTitle),
      progress_completion_text: normalizeNullable(
        project.progressCompletionText,
        existing.progressCompletionText,
      ),
      location_title: normalizeNullable(project.locationTitle, existing.locationTitle),
      contact_title: normalizeNullable(project.contactTitle, existing.contactTitle),
      contact_body: normalizeNullable(project.contactBody, existing.contactBody),
      sales_phone: normalizeNullable(project.salesPhone, existing.salesPhone),
      footer_disclaimer: normalizeNullable(project.footerDisclaimer, existing.footerDisclaimer),
      map_lat: normalizeNullableNumber(project.mapLat, existing.mapLat),
      map_lng: normalizeNullableNumber(project.mapLng, existing.mapLng),
      map_zoom: normalizeNullableNumber(project.mapZoom, existing.mapZoom),
      publish_status: publishStatus,
      published_at: publishedAt,
    })
    .eq('id', id)
    .eq('merchant_user_id', auth.user.id)
    .select('*')
    .single()

  if (propertyError || !updatedProperty) {
    return NextResponse.json(
      { error: `Failed to update project: ${propertyError?.message ?? 'Unknown error'}` },
      { status: 500 },
    )
  }

  const sanitizedItems = sanitizeContentItems(contentItems)
  const sanitizedModules = sanitizeModules(modules)

  const { error: deleteError } = await admin
    .from('property_content_items')
    .delete()
    .eq('property_id', id)

  if (deleteError) {
    return NextResponse.json(
      { error: `Failed to replace project content: ${deleteError.message}` },
      { status: 500 },
    )
  }

  const { data: insertedItems, error: insertError } = await admin
    .from('property_content_items')
    .insert(
      sanitizedItems.map((item) => ({
        property_id: id,
        group_key: item.groupKey,
        item_key: item.itemKey,
        title: item.title,
        body: item.body,
        meta: item.meta,
        accent: item.accent,
        state: item.state,
        sort_order: item.sortOrder,
      })),
    )
    .select('id,property_id,group_key,item_key,title,body,meta,accent,state,sort_order')

  if (insertError) {
    return NextResponse.json(
      { error: `Failed to save project content: ${insertError.message}` },
      { status: 500 },
    )
  }

  const { error: deleteModulesError } = await admin
    .from('property_modules')
    .delete()
    .eq('property_id', id)

  if (deleteModulesError) {
    return NextResponse.json(
      { error: `Failed to replace project modules: ${deleteModulesError.message}` },
      { status: 500 },
    )
  }

  const { data: insertedModules, error: insertModulesError } = await admin
    .from('property_modules')
    .insert(
      sanitizedModules.map((module) => ({
        id: module.id,
        property_id: id,
        module_type: module.moduleType,
        sort_order: module.sortOrder,
        is_visible: module.isVisible,
        settings_json: module.settings,
      })),
    )
    .select('id,property_id,module_type,sort_order,is_visible,settings_json')

  if (insertModulesError) {
    return NextResponse.json(
      { error: `Failed to save project modules: ${insertModulesError.message}` },
      { status: 500 },
    )
  }

  const detail = toMerchantProjectDetail(
    updatedProperty,
    existing.images.map((image) => ({
      id: image.id,
      property_id: id,
      section_key: image.sectionKey,
      storage_bucket: 'property-media',
      storage_path: image.storagePath,
      alt_text: image.altText,
      sort_order: image.sortOrder ?? 0,
    })),
    insertedItems ?? [],
    insertedModules ?? [],
  )

  return NextResponse.json({ ok: true, project: detail })
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  const { id } = await context.params
  const existing = await getMerchantProjectDetail(auth.user.id, id)
  if (!existing) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  const admin = getSupabaseAdminClient()

  // 1. Delete storage files
  const storagePaths = existing.images
    .map((img) => img.storagePath)
    .filter(Boolean)
  if (storagePaths.length > 0) {
    await admin.storage.from('property-media').remove(storagePaths).catch(() => null)
  }

  // 2. Delete content items (cascade should handle this, but explicit is safer)
  await admin.from('property_content_items').delete().eq('property_id', id)

  // 3. Delete image rows
  await admin.from('property_images').delete().eq('property_id', id)

  // 4. Delete the property itself
  const { error } = await admin
    .from('properties')
    .delete()
    .eq('id', id)
    .eq('merchant_user_id', auth.user.id)

  if (error) {
    return NextResponse.json({ error: `Failed to delete project: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

function normalizeString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

function normalizeNullable(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback
  return value.trim()
}

function normalizeNullableNumber(value: unknown, fallback: number) {
  if (value === null || value === undefined || value === '') return fallback
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function sanitizeContentItems(items: PropertyContentItem[]) {
  return items
    .map((item, index) => ({
      groupKey: item.groupKey,
      itemKey: item.itemKey ?? null,
      title: trimToNull(item.title),
      body: trimToNull(item.body),
      meta: trimToNull(item.meta),
      accent: trimToNull(item.accent),
      state: item.state ?? null,
      sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

function sanitizeModules(modules: PropertyModule[]) {
  const source = modules.length > 0 ? modules : createDefaultPropertyModules()
  const seenSingletons = new Set<string>()
  const normal: PropertyModule[] = []
  const pinned: PropertyModule[] = []

  for (const projectModule of source) {
    const isPinned = projectModule.moduleType === 'contact' || projectModule.moduleType === 'footer'
    const isSingleton = projectModule.moduleType !== 'image_section'

    if (isSingleton) {
      if (seenSingletons.has(projectModule.moduleType)) continue
      seenSingletons.add(projectModule.moduleType)
    }

    const sanitized: PropertyModule = {
      id: typeof projectModule.id === 'string' && projectModule.id.trim().length > 0 ? projectModule.id : crypto.randomUUID(),
      moduleType: projectModule.moduleType,
      sortOrder: Number.isFinite(projectModule.sortOrder) ? projectModule.sortOrder : 0,
      isVisible: projectModule.isVisible !== false,
      settings: (() => {
        const s = projectModule.settings as PropertyModule['settings']
        const base: PropertyModule['settings'] = {
          title: trimToNull(s.title) ?? '',
          body: trimToNull(s.body) ?? '',
          primaryImageSectionKey: trimToNull(s.primaryImageSectionKey),
          secondaryImageSectionKey: trimToNull(s.secondaryImageSectionKey),
        }
        if (s.floorPlanUnitCount != null) base.floorPlanUnitCount = s.floorPlanUnitCount
        if (s.teamMemberCount != null)    base.teamMemberCount    = s.teamMemberCount
        if (s.captions != null)           base.captions           = s.captions
        if (s.themeKey != null)           base.themeKey           = s.themeKey
        return base
      })(),
    }

    if (isPinned) pinned.push(sanitized)
    else normal.push(sanitized)
  }

  normal.sort((a, b) => a.sortOrder - b.sortOrder)

  return [...normal, ...pinned].map((module, index) => ({
    ...module,
    sortOrder: index,
  }))
}

function trimToNull(value: string | null | undefined) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

async function ensureUniqueSlug(slug: string, propertyId: string) {
  const admin = getSupabaseAdminClient()
  const { data } = await admin
    .from('properties')
    .select('id')
    .eq('slug', slug)
    .neq('id', propertyId)
    .maybeSingle()

  if (!data) return slug
  return `${slug}-${crypto.randomUUID().slice(0, 6)}`
}
