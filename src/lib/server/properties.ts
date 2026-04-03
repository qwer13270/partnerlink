import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  DEFAULT_PROPERTY_FIELDS,
  buildTongchuangTemplateContent,
  cloneDefaultContentItems,
  createDefaultPropertyModules,
  type PropertyContentItem,
  type PropertyModule,
  type TongchuangTemplateContent,
} from '@/lib/property-template'

type PropertyRow = {
  id: string
  merchant_profile_id: string
  merchant_user_id: string
  template_key: string
  slug: string
  publish_status: 'draft' | 'published'
  name: string
  subtitle: string | null
  district_label: string | null
  completion_badge: string | null
  overview_title: string | null
  overview_body: string | null
  features_title: string | null
  progress_title: string | null
  progress_completion_text: string | null
  location_title: string | null
  contact_title: string | null
  contact_body: string | null
  sales_phone: string | null
  footer_disclaimer: string | null
  map_lat: number | null
  map_lng: number | null
  map_zoom: number | null
  collab_description: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

type PropertyImageRow = {
  id: string
  property_id: string
  section_key: string
  storage_bucket: string
  storage_path: string
  alt_text: string | null
  sort_order: number | null
}

type PropertyContentItemRow = {
  id: string
  property_id: string
  group_key: PropertyContentItem['groupKey']
  item_key: string | null
  title: string | null
  body: string | null
  meta: string | null
  accent: string | null
  state: PropertyContentItem['state']
  sort_order: number | null
}

type PropertyModuleRow = {
  id: string
  property_id: string
  module_type: PropertyModule['moduleType']
  sort_order: number | null
  is_visible: boolean | null
  settings_json: unknown
}

export type MerchantProjectSummary = {
  id: string
  slug: string
  name: string
  templateKey: string
  publishStatus: 'draft' | 'published'
  updatedAt: string
  createdAt: string
}

export type MerchantProjectDetail = MerchantProjectSummary & {
  merchantProfileId: string
  merchantUserId: string
  subtitle: string
  districtLabel: string
  completionBadge: string
  overviewTitle: string
  overviewBody: string
  featuresTitle: string
  progressTitle: string
  progressCompletionText: string
  locationTitle: string
  contactTitle: string
  contactBody: string
  salesPhone: string
  footerDisclaimer: string
  mapLat: number
  mapLng: number
  mapZoom: number
  images: Array<{
    id: string
    sectionKey: string
    url: string
    altText: string
    storagePath: string
    sortOrder: number
  }>
  collabDescription: string | null
  contentItems: PropertyContentItem[]
  modules: PropertyModule[]
  template: TongchuangTemplateContent
}

function toPublicStorageUrl(bucket: string, path: string) {
  const admin = getSupabaseAdminClient()
  return admin.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export async function getMerchantProfileForUser(userId: string) {
  const admin = getSupabaseAdminClient()
  const { data, error } = await admin
    .from('merchant_profiles')
    .select('id,user_id,company_name')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (error || !data) return null

  return {
    id: String(data.id),
    userId: String(data.user_id),
    companyName: String(data.company_name ?? ''),
  }
}

export async function listMerchantProjects(userId: string) {
  const admin = getSupabaseAdminClient()
  const { data, error } = await admin
    .from('properties')
    .select('id,slug,name,template_key,publish_status,created_at,updated_at')
    .eq('merchant_user_id', userId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to load projects: ${error.message}`)
  }

  return ((data ?? []) as Array<{
    id: string
    slug: string
    name: string
    template_key: string
    publish_status: 'draft' | 'published'
    created_at: string
    updated_at: string
  }>).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    templateKey: row.template_key,
    publishStatus: row.publish_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export type ArchivedProjectSummary = {
  id: string
  name: string
  templateKey: string
  archivedAt: string
  createdAt: string
}

export type ArchivedProjectDetail = {
  id: string
  name: string
  templateKey: string
  districtLabel: string | null
  archivedAt: string
  createdAt: string
  publishedAt: string | null
}

export async function getMerchantArchivedProjectDetail(
  userId: string,
  projectId: string,
): Promise<ArchivedProjectDetail | null> {
  const admin = getSupabaseAdminClient()
  const { data, error } = await admin
    .from('properties')
    .select('id,name,template_key,district_label,archived_at,created_at,published_at')
    .eq('id', projectId)
    .eq('merchant_user_id', userId)
    .eq('is_archived', true)
    .maybeSingle()

  if (error || !data) return null

  const row = data as {
    id: string
    name: string
    template_key: string
    district_label: string | null
    archived_at: string | null
    created_at: string
    published_at: string | null
  }

  return {
    id: row.id,
    name: row.name,
    templateKey: row.template_key,
    districtLabel: row.district_label,
    archivedAt: row.archived_at ?? row.created_at,
    createdAt: row.created_at,
    publishedAt: row.published_at,
  }
}

export async function listArchivedMerchantProjects(userId: string): Promise<ArchivedProjectSummary[]> {
  const admin = getSupabaseAdminClient()
  const { data, error } = await admin
    .from('properties')
    .select('id,name,template_key,archived_at,created_at')
    .eq('merchant_user_id', userId)
    .eq('is_archived', true)
    .order('archived_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to load archived projects: ${error.message}`)
  }

  return ((data ?? []) as Array<{
    id: string
    name: string
    template_key: string
    archived_at: string | null
    created_at: string
  }>).map((row) => ({
    id: row.id,
    name: row.name,
    templateKey: row.template_key,
    archivedAt: row.archived_at ?? row.created_at,
    createdAt: row.created_at,
  }))
}

async function getPropertyRowsById(propertyId: string) {
  const admin = getSupabaseAdminClient()
  const [
    { data: property, error: propertyError },
    { data: images, error: imagesError },
    { data: contentItems, error: contentItemsError },
    { data: modules, error: modulesError },
  ] = await Promise.all([
    admin.from('properties').select('*').eq('id', propertyId).single(),
    admin
      .from('property_images')
      .select('id,property_id,section_key,storage_bucket,storage_path,alt_text,sort_order')
      .eq('property_id', propertyId)
      .order('sort_order', { ascending: true }),
    admin
      .from('property_content_items')
      .select('id,property_id,group_key,item_key,title,body,meta,accent,state,sort_order')
      .eq('property_id', propertyId)
      .order('sort_order', { ascending: true }),
    admin
      .from('property_modules')
      .select('id,property_id,module_type,sort_order,is_visible,settings_json')
      .eq('property_id', propertyId)
      .order('sort_order', { ascending: true }),
  ])

  if (propertyError || !property) {
    throw new Error(propertyError?.message ?? 'Property not found.')
  }
  if (imagesError) {
    throw new Error(`Failed to load property images: ${imagesError.message}`)
  }
  if (contentItemsError) {
    throw new Error(`Failed to load property content: ${contentItemsError.message}`)
  }
  if (modulesError) {
    throw new Error(`Failed to load property modules: ${modulesError.message}`)
  }

  return {
    property: property as PropertyRow,
    images: (images ?? []) as PropertyImageRow[],
    contentItems: (contentItems ?? []) as PropertyContentItemRow[],
    modules: (modules ?? []) as PropertyModuleRow[],
  }
}

export async function getMerchantProjectDetail(userId: string, propertyId: string) {
  const rows = await getPropertyRowsById(propertyId)
  if (rows.property.merchant_user_id !== userId) return null
  // Archived projects are treated as non-existent for editing purposes
  if ((rows.property as unknown as { is_archived?: boolean }).is_archived) return null
  return toMerchantProjectDetail(rows.property, rows.images, rows.contentItems, rows.modules)
}

export async function getPublishedPropertyBySlug(slug: string) {
  const admin = getSupabaseAdminClient()
  const { data, error } = await admin
    .from('properties')
    .select('id')
    .eq('slug', slug)
    .eq('publish_status', 'published')
    .single()

  if (error || !data) return null
  const rows = await getPropertyRowsById(String(data.id))
  if (rows.property.publish_status !== 'published') return null
  return toMerchantProjectDetail(rows.property, rows.images, rows.contentItems, rows.modules)
}

export function toMerchantProjectDetail(
  property: PropertyRow,
  images: PropertyImageRow[],
  contentItems: PropertyContentItemRow[],
  modules: PropertyModuleRow[],
): MerchantProjectDetail {
  const normalizedItems: PropertyContentItem[] =
    contentItems.length > 0
      ? contentItems.map((item) => ({
          id: item.id,
          groupKey: item.group_key,
          itemKey: item.item_key,
          title: item.title,
          body: item.body,
          meta: item.meta,
          accent: item.accent,
          state: item.state,
          sortOrder: item.sort_order ?? 0,
        }))
      : cloneDefaultContentItems()

  const normalizedModules: PropertyModule[] =
    modules.length > 0
      ? modules.map((module) => ({
          id: module.id,
          moduleType: module.module_type,
          sortOrder: module.sort_order ?? 0,
          isVisible: module.is_visible !== false,
          settings:
            module.settings_json && typeof module.settings_json === 'object'
              ? (module.settings_json as PropertyModule['settings'])
              : {},
        }))
      : createDefaultPropertyModules()

  const imageList = images
    .map((image) => ({
      id: image.id,
      sectionKey: image.section_key,
      url: toPublicStorageUrl(image.storage_bucket, image.storage_path),
      altText: image.alt_text ?? '',
      storagePath: image.storage_path,
      sortOrder: image.sort_order ?? 0,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const template = buildTongchuangTemplateContent(
    {
      id: property.id,
      slug: property.slug,
      publishStatus: property.publish_status,
      name: property.name,
      subtitle: property.subtitle,
      districtLabel: property.district_label,
      completionBadge: property.completion_badge,
      overviewTitle: property.overview_title,
      overviewBody: property.overview_body,
      featuresTitle: property.features_title,
      progressTitle: property.progress_title,
      progressCompletionText: property.progress_completion_text,
      locationTitle: property.location_title,
      contactTitle: property.contact_title,
      contactBody: property.contact_body,
      salesPhone: property.sales_phone,
      footerDisclaimer: property.footer_disclaimer,
      mapLat: property.map_lat,
      mapLng: property.map_lng,
      mapZoom: property.map_zoom,
    },
    imageList.map((image) => ({
      sectionKey: image.sectionKey,
      url: image.url,
      altText: image.altText,
      sortOrder: image.sortOrder,
    })),
    normalizedItems,
    normalizedModules,
  )

  return {
    id: property.id,
    slug: property.slug,
    name: property.name,
    templateKey: property.template_key,
    publishStatus: property.publish_status,
    createdAt: property.created_at,
    updatedAt: property.updated_at,
    merchantProfileId: property.merchant_profile_id,
    merchantUserId: property.merchant_user_id,
    subtitle: property.subtitle ?? DEFAULT_PROPERTY_FIELDS.subtitle,
    districtLabel: property.district_label ?? DEFAULT_PROPERTY_FIELDS.districtLabel,
    completionBadge: property.completion_badge ?? DEFAULT_PROPERTY_FIELDS.completionBadge,
    overviewTitle: property.overview_title ?? DEFAULT_PROPERTY_FIELDS.overviewTitle,
    overviewBody: property.overview_body ?? DEFAULT_PROPERTY_FIELDS.overviewBody,
    featuresTitle: property.features_title ?? DEFAULT_PROPERTY_FIELDS.featuresTitle,
    progressTitle: property.progress_title ?? DEFAULT_PROPERTY_FIELDS.progressTitle,
    progressCompletionText:
      property.progress_completion_text ?? DEFAULT_PROPERTY_FIELDS.progressCompletionText,
    locationTitle: property.location_title ?? DEFAULT_PROPERTY_FIELDS.locationTitle,
    contactTitle: property.contact_title ?? DEFAULT_PROPERTY_FIELDS.contactTitle,
    contactBody: property.contact_body ?? DEFAULT_PROPERTY_FIELDS.contactBody,
    salesPhone: property.sales_phone ?? DEFAULT_PROPERTY_FIELDS.salesPhone,
    footerDisclaimer: property.footer_disclaimer ?? DEFAULT_PROPERTY_FIELDS.footerDisclaimer,
    mapLat: typeof property.map_lat === 'number' ? property.map_lat : DEFAULT_PROPERTY_FIELDS.mapLat,
    mapLng: typeof property.map_lng === 'number' ? property.map_lng : DEFAULT_PROPERTY_FIELDS.mapLng,
    mapZoom: typeof property.map_zoom === 'number' ? property.map_zoom : DEFAULT_PROPERTY_FIELDS.mapZoom,
    collabDescription: property.collab_description ?? null,
    images: imageList,
    contentItems: normalizedItems,
    modules: normalizedModules,
    template,
  }
}
