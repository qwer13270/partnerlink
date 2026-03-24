import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  cloneDefaultContentItems,
  createDefaultPropertyModules,
  getDefaultPropertyInsert,
  parsePublishStatus,
  slugifyPropertyName,
  PROPERTY_TEMPLATE_KEYS,
} from '@/lib/property-template'
import {
  getMerchantProfileForUser,
  listMerchantProjects,
  toMerchantProjectDetail,
} from '@/lib/server/properties'
import { requireApiRole } from '@/lib/server/api-auth'

type CreateProjectBody = {
  name?: string
  slug?: string
  templateKey?: string
}

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  try {
    const projects = await listMerchantProjects(auth.user.id)
    return NextResponse.json({ ok: true, projects })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load projects.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  const merchantProfile = await getMerchantProfileForUser(auth.user.id)
  if (!merchantProfile) {
    return NextResponse.json({ error: 'Merchant profile not found.' }, { status: 404 })
  }

  const body = (await request.json().catch(() => ({}))) as CreateProjectBody
  const defaults = getDefaultPropertyInsert()
  const rawName = typeof body.name === 'string' ? body.name.trim() : ''
  const name = rawName || defaults.name

  // Template key — validate against known set, fall back to default
  const templateKey = PROPERTY_TEMPLATE_KEYS.includes(body.templateKey as typeof PROPERTY_TEMPLATE_KEYS[number])
    ? (body.templateKey as typeof PROPERTY_TEMPLATE_KEYS[number])
    : defaults.templateKey

  // Slug — use provided slug if valid, otherwise auto-generate
  const rawSlug = typeof body.slug === 'string' ? slugifyPropertyName(body.slug) : ''
  let slug: string
  if (rawSlug && rawSlug !== 'merchant-project') {
    // Verify the provided slug is not already taken
    const admin2 = getSupabaseAdminClient()
    const { data: existing } = await admin2.from('properties').select('id').eq('slug', rawSlug).maybeSingle()
    if (existing) {
      return NextResponse.json({ error: `slug "${rawSlug}" 已被使用，請更換。` }, { status: 409 })
    }
    slug = rawSlug
  } else {
    slug = await generateUniqueSlug(name)
  }

  const admin = getSupabaseAdminClient()
  const publishStatus = parsePublishStatus(undefined)
  const { data: property, error: propertyError } = await admin
    .from('properties')
    .insert({
      merchant_profile_id: merchantProfile.id,
      merchant_user_id: auth.user.id,
      template_key: templateKey,
      slug,
      publish_status: publishStatus,
      name,
      subtitle: defaults.subtitle,
      district_label: defaults.districtLabel,
      completion_badge: defaults.completionBadge,
      overview_title: defaults.overviewTitle,
      overview_body: defaults.overviewBody,
      features_title: defaults.featuresTitle,
      progress_title: defaults.progressTitle,
      progress_completion_text: defaults.progressCompletionText,
      location_title: defaults.locationTitle,
      contact_title: defaults.contactTitle,
      contact_body: defaults.contactBody,
      sales_phone: defaults.salesPhone,
      footer_disclaimer: defaults.footerDisclaimer,
      map_lat: defaults.mapLat,
      map_lng: defaults.mapLng,
      map_zoom: defaults.mapZoom,
      published_at: publishStatus === 'published' ? new Date().toISOString() : null,
    })
    .select('*')
    .single()

  if (propertyError || !property) {
    return NextResponse.json(
      { error: `Failed to create project: ${propertyError?.message ?? 'Unknown error'}` },
      { status: 500 },
    )
  }

  const contentItems = cloneDefaultContentItems()
  const modules = createDefaultPropertyModules()
  const { data: insertedItems, error: contentError } = await admin
    .from('property_content_items')
    .insert(
      contentItems.map((item) => ({
        property_id: property.id,
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

  if (contentError) {
    await admin.from('properties').delete().eq('id', property.id)
    return NextResponse.json(
      { error: `Failed to seed project content: ${contentError.message}` },
      { status: 500 },
    )
  }

  const { error: modulesError } = await admin
    .from('property_modules')
    .insert(
      modules.map((module) => ({
        id: module.id,
        property_id: property.id,
        module_type: module.moduleType,
        sort_order: module.sortOrder,
        is_visible: module.isVisible,
        settings_json: module.settings,
      })),
    )

  if (modulesError) {
    await admin.from('properties').delete().eq('id', property.id)
    return NextResponse.json(
      { error: `Failed to seed project modules: ${modulesError.message}` },
      { status: 500 },
    )
  }

  const detail = toMerchantProjectDetail(property, [], insertedItems ?? [], modules.map((module) => ({
    id: module.id,
    property_id: property.id,
    module_type: module.moduleType,
    sort_order: module.sortOrder,
    is_visible: module.isVisible,
    settings_json: module.settings,
  })))
  return NextResponse.json({ ok: true, project: detail }, { status: 201 })
}

async function generateUniqueSlug(name: string) {
  const admin = getSupabaseAdminClient()
  const base = slugifyPropertyName(name)

  for (let index = 0; index < 50; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`
    const { data } = await admin
      .from('properties')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()

    if (!data) return candidate
  }

  return `${base}-${crypto.randomUUID().slice(0, 8)}`
}
