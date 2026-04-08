'use client'

import { useEffect, useMemo, useState, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  buildTongchuangTemplateContent,
  buildShangAnTemplateContent,
  createImageSectionModule,
  DEFAULT_FONT_KEY,
  DEFAULT_PROPERTY_CONTENT_ITEMS,
  DEFAULT_SHANGAN_CONTENT_ITEMS,
  DEFAULT_THEME_KEY,
  getModuleDefinition,
  isEnglishSlug,
  type PropertyFontKey,
  type PropertyContentItem,
  type PropertyModule,
  type PropertyModuleType,
  type PropertyThemeKey,
  type ShangAnTemplateContent,
  type TongchuangTemplateContent,
} from '@/lib/property-template'
import { IMAGE_SLOT_LABELS, type ProjectDetail, type ProjectImage } from './_types'

// ── Public hook interface ─────────────────────────────────────────────────────

export type EditorState = ReturnType<typeof useEditor>

export function useEditor(id: string) {
  const router = useRouter()

  // ── Core data ──────────────────────────────────────────────────────────────
  const [savedProject,  setSavedProject]  = useState<ProjectDetail | null>(null)
  const [draftProject,  setDraftProject]  = useState<ProjectDetail | null>(null)

  // ── UI state ───────────────────────────────────────────────────────────────
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [sidebarView,      setSidebarView]      = useState<'list' | 'edit' | 'theme' | 'font'>('list')
  const [loading,          setLoading]          = useState(true)
  const [saving,           setSaving]           = useState(false)
  const [publishing,       setPublishing]       = useState(false)
  const [uploadingSlot,    setUploadingSlot]    = useState<string | null>(null)
  const [showDeleteModal,  setShowDeleteModal]  = useState(false)
  const [deleting,         setDeleting]         = useState(false)
  const [pendingLeavePath, setPendingLeavePath] = useState<string | null>(null)

  // ── Data loading ───────────────────────────────────────────────────────────
  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const res = await fetch(`/api/merchant/projects/${id}`, { cache: 'no-store' })
      const payload = await res.json().catch(() => ({}))
      if (!active) return
      if (!res.ok) {
        toast.error(payload.error ?? '載入商案失敗')
        setLoading(false)
        return
      }
      const raw = payload.project as (ProjectDetail & { type?: string }) | null
      const project: ProjectDetail | null = raw
        ? { ...raw, templateKey: raw.type === 'shop' ? 'shop' : 'property' }
        : null
      setSavedProject(project)
      setDraftProject(project)
      setSelectedModuleId(project?.modules?.[0]?.id ?? null)
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [id])

  // ── Dirty tracking ─────────────────────────────────────────────────────────
  const isDirty = useMemo(() => {
    if (!savedProject || !draftProject) return false
    return JSON.stringify(projectSnapshot(savedProject)) !== JSON.stringify(projectSnapshot(draftProject))
  }, [savedProject, draftProject])

  useEffect(() => {
    if (!isDirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // ── Derived values ─────────────────────────────────────────────────────────
  const liveTemplate = useMemo<TongchuangTemplateContent | ShangAnTemplateContent | null>(
    () => (draftProject ? toLiveTemplate(draftProject) : null),
    [draftProject],
  )

  const selectedModule = useMemo(
    () => draftProject?.modules.find((m) => m.id === selectedModuleId) ?? null,
    [draftProject, selectedModuleId],
  )

  const normalModules = useMemo(
    () => (draftProject?.modules ?? []).filter((m) => !getModuleDefinition(m.moduleType).pinned),
    [draftProject],
  )

  const pinnedModules = useMemo(
    () => (draftProject?.modules ?? []).filter((m) => getModuleDefinition(m.moduleType).pinned),
    [draftProject],
  )

  const currentTheme = useMemo(
    () => (draftProject?.modules.find((m) => m.moduleType === 'color_theme')?.settings.themeKey as PropertyThemeKey | undefined) ?? DEFAULT_THEME_KEY,
    [draftProject],
  )

  const currentFont = useMemo(
    () => (draftProject?.modules.find((m) => m.moduleType === 'color_theme')?.settings.fontKey as PropertyFontKey | undefined) ?? DEFAULT_FONT_KEY,
    [draftProject],
  )

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleImageUpload(sectionKey: string, file: File | null, sortOrder?: number) {
    if (!file || !draftProject) return
    setUploadingSlot(sectionKey)

    const form = new FormData()
    form.set('sectionKey', sectionKey)
    form.set('file', file)
    form.set('altText', `${draftProject.name} ${IMAGE_SLOT_LABELS[sectionKey] ?? sectionKey}`)
    if (sortOrder !== undefined) form.set('sortOrder', String(sortOrder))

    const res = await fetch(`/api/merchant/projects/${id}/images`, { method: 'POST', body: form })
    const payload = await res.json().catch(() => ({}))
    setUploadingSlot(null)

    if (!res.ok || !payload.image) {
      toast.error(payload.error ?? '圖片上傳失敗')
      return
    }

    const update = (p: ProjectDetail | null) =>
      p ? { ...p, images: replaceImage(p.images, payload.image as ProjectImage) } : p
    setDraftProject(update)
    setSavedProject(update)
    toast.success(`${IMAGE_SLOT_LABELS[sectionKey] ?? '圖片'} 已更新`)
  }

  async function handleImageDelete(imageId: string) {
    const res = await fetch(`/api/merchant/projects/${id}/images/${imageId}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('刪除圖片失敗'); return }

    const update = (p: ProjectDetail | null) =>
      p ? { ...p, images: p.images.filter((img) => img.id !== imageId) } : p
    setDraftProject(update)
    setSavedProject(update)
    toast.success('圖片已刪除')
  }

  async function handleSave(targetStatus?: 'draft' | 'published') {
    const project = draftProject
    if (!project) return
    const scalars = toProjectScalars(project)
    if (!isEnglishSlug(scalars.slug)) {
      toast.error('公開網址只能使用英文、數字與連字號')
      return
    }

    if (targetStatus) setPublishing(true)
    else setSaving(true)

    const res = await fetch(`/api/merchant/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: {
          ...scalars,
          mapLat:        Number(project.mapLat),
          mapLng:        Number(project.mapLng),
          mapZoom:       Number(project.mapZoom),
          publishStatus: targetStatus ?? project.publishStatus,
        },
        contentItems: project.contentItems,
        modules:      project.modules,
      }),
    })

    const payload = await res.json().catch(() => ({}))
    setSaving(false)
    setPublishing(false)

    if (!res.ok || !payload.project) {
      toast.error(payload.error ?? (targetStatus === 'published' ? '發布失敗' : '儲存失敗'))
      return
    }

    const raw = payload.project as (ProjectDetail & { type?: string })
    const saved: ProjectDetail = { ...raw, templateKey: raw.type === 'shop' ? 'shop' : 'property' }
    setSavedProject(saved)
    setDraftProject(saved)
    toast.success(targetStatus === 'published' ? '商案已發布' : '已儲存')
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/merchant/projects/${id}`, { method: 'DELETE' })
    const payload = await res.json().catch(() => ({}))
    setDeleting(false)
    if (!res.ok) { toast.error(payload.error ?? '刪除失敗'); return }
    toast.success('商案已刪除')
    router.push('/merchant/projects')
  }

  function handleConfirmLeave(path: string) {
    if (isDirty) { setPendingLeavePath(path); return }
    startTransition(() => router.push(path))
  }

  function confirmLeave() {
    if (!pendingLeavePath) return
    startTransition(() => router.push(pendingLeavePath))
    setPendingLeavePath(null)
  }

  function cancelLeave() {
    setPendingLeavePath(null)
  }

  // ── Field / content / module mutators ─────────────────────────────────────

  function updateProjectField<K extends keyof ProjectDetail>(key: K, value: ProjectDetail[K]) {
    setDraftProject((p) => (p ? { ...p, [key]: value } : p))
  }

  function updateContentItem(index: number, key: keyof PropertyContentItem, value: string | null) {
    setDraftProject((p) => {
      if (!p) return p
      return {
        ...p,
        contentItems: p.contentItems.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
      }
    })
  }

  function updateModule(moduleId: string, updater: (m: PropertyModule) => PropertyModule) {
    setDraftProject((p) => {
      if (!p) return p
      return { ...p, modules: p.modules.map((m) => (m.id === moduleId ? updater(m) : m)) }
    })
  }

  function toggleModuleVisibility(moduleId: string) {
    updateModule(moduleId, (m) => ({ ...m, isVisible: !m.isVisible }))
  }

  function reorderModules(newNormalModules: PropertyModule[]) {
    setDraftProject((p) => {
      if (!p) return p
      const pinned = p.modules.filter((m) => getModuleDefinition(m.moduleType).pinned)
      const reordered = newNormalModules.map((m, i) => ({ ...m, sortOrder: i }))
      const tail = pinned.map((m, i) => ({ ...m, sortOrder: reordered.length + i }))
      return { ...p, modules: [...reordered, ...tail] }
    })
  }

  function addModule(type: PropertyModuleType): string | null {
    const definition = getModuleDefinition(type)

    // Singleton types can only have one instance — navigate to the existing one
    if (definition.singleton) {
      const existing = draftProject?.modules.find((m) => m.moduleType === type)
      if (existing) {
        setSelectedModuleId(existing.id)
        setSidebarView('edit')
        return existing.id
      }
    }

    const newModule: PropertyModule =
      type === 'image_section'
        ? createImageSectionModule()
        : {
            id: crypto.randomUUID(),
            moduleType: type,
            sortOrder: 0,
            isVisible: true,
            settings: {},
          }
    setDraftProject((p) => {
      if (!p) return p
      const pinned = p.modules.filter((m) => getModuleDefinition(m.moduleType).pinned)
      const normal = p.modules.filter((m) => !getModuleDefinition(m.moduleType).pinned)
      const nextNormal = [...normal, { ...newModule, sortOrder: normal.length }]
      const nextPinned = pinned.map((m, i) => ({ ...m, sortOrder: nextNormal.length + i }))

      // Inject default content items for modules that need them
      let contentItems = p.contentItems
      if (type === 'floor_plan' && !p.contentItems.some((item) => item.groupKey === 'floor_plan_units')) {
        contentItems = [...contentItems, ...DEFAULT_PROPERTY_CONTENT_ITEMS.filter((item) => item.groupKey === 'floor_plan_units')]
      }
      if (type === 'team' && !p.contentItems.some((item) => item.groupKey === 'team_members')) {
        contentItems = [...contentItems, ...DEFAULT_PROPERTY_CONTENT_ITEMS.filter((item) => item.groupKey === 'team_members')]
      }
      if (type === 'shop_products' && !p.contentItems.some((item) => item.groupKey === 'shop_products')) {
        contentItems = [...contentItems, ...DEFAULT_SHANGAN_CONTENT_ITEMS.filter((item) => item.groupKey === 'shop_products')]
      }
      if (type === 'shop_features' && !p.contentItems.some((item) => item.groupKey === 'shop_features')) {
        contentItems = [...contentItems, ...DEFAULT_SHANGAN_CONTENT_ITEMS.filter((item) => item.groupKey === 'shop_features')]
      }
      if (type === 'shop_faq' && !p.contentItems.some((item) => item.groupKey === 'shop_faq')) {
        contentItems = [...contentItems, ...DEFAULT_SHANGAN_CONTENT_ITEMS.filter((item) => item.groupKey === 'shop_faq')]
      }

      return { ...p, modules: [...nextNormal, ...nextPinned], contentItems }
    })
    setSelectedModuleId(newModule.id)
    setSidebarView('edit')
    return newModule.id
  }

  function removeModule(moduleId: string) {
    setDraftProject((p) => {
      if (!p) return p
      const nextModules = p.modules
        .filter((m) => m.id !== moduleId)
        .map((m, i) => ({ ...m, sortOrder: i }))
      return { ...p, modules: nextModules }
    })
    setSelectedModuleId((current) => {
      if (current !== moduleId) return current
      return draftProject?.modules.find((m) => m.id !== moduleId)?.id ?? null
    })
    setSidebarView('list')
  }

  function selectModule(moduleId: string) {
    setSelectedModuleId(moduleId)
    setSidebarView('edit')
  }

  function setColorTheme(key: PropertyThemeKey) {
    setDraftProject((p) => {
      if (!p) return p
      const existing = p.modules.find((m) => m.moduleType === 'color_theme')
      if (existing) {
        return {
          ...p,
          modules: p.modules.map((m) =>
            m.moduleType === 'color_theme' ? { ...m, settings: { ...m.settings, themeKey: key } } : m,
          ),
        }
      }
      const newModule: PropertyModule = {
        id: crypto.randomUUID(),
        moduleType: 'color_theme',
        sortOrder: p.modules.length,
        isVisible: true,
        settings: { themeKey: key },
      }
      return { ...p, modules: [...p.modules, newModule] }
    })
  }

  function setFontTheme(key: PropertyFontKey) {
    setDraftProject((p) => {
      if (!p) return p
      const existing = p.modules.find((m) => m.moduleType === 'color_theme')
      if (existing) {
        return {
          ...p,
          modules: p.modules.map((m) =>
            m.moduleType === 'color_theme' ? { ...m, settings: { ...m.settings, fontKey: key } } : m,
          ),
        }
      }
      const newModule: PropertyModule = {
        id: crypto.randomUUID(),
        moduleType: 'color_theme',
        sortOrder: p.modules.length,
        isVisible: true,
        settings: { fontKey: key },
      }
      return { ...p, modules: [...p.modules, newModule] }
    })
  }

  return {
    // Data
    draftProject,
    savedProject,
    liveTemplate,
    selectedModule,
    normalModules,
    pinnedModules,
    currentTheme,
    currentFont,
    // Status
    loading,
    saving,
    publishing,
    isDirty,
    uploadingSlot,
    showDeleteModal,
    deleting,
    sidebarView,
    // Setters
    setShowDeleteModal,
    setSidebarView,
    // Handlers
    handleImageUpload,
    handleImageDelete,
    handleSave,
    handleDelete,
    handleConfirmLeave,
    pendingLeavePath,
    confirmLeave,
    cancelLeave,
    updateProjectField,
    updateContentItem,
    updateModule,
    toggleModuleVisibility,
    reorderModules,
    addModule,
    removeModule,
    selectModule,
    setColorTheme,
    setFontTheme,
  }
}

// ── Private helpers ───────────────────────────────────────────────────────────

function toProjectScalars(project: ProjectDetail) {
  return {
    slug:                   project.slug.trim().toLowerCase(),
    name:                   project.name,
    collabDescription:      project.collabDescription,
    subtitle:               project.subtitle,
    districtLabel:          project.districtLabel,
    completionBadge:        project.completionBadge,
    overviewTitle:          project.overviewTitle,
    overviewBody:           project.overviewBody,
    featuresTitle:          project.featuresTitle,
    progressTitle:          project.progressTitle,
    progressCompletionText: project.progressCompletionText,
    locationTitle:          project.locationTitle,
    contactTitle:           project.contactTitle,
    contactBody:            project.contactBody,
    salesPhone:             project.salesPhone,
    footerDisclaimer:       project.footerDisclaimer,
    mapLat:                 project.mapLat,
    mapLng:                 project.mapLng,
    mapZoom:                project.mapZoom,
  }
}

function projectSnapshot(project: ProjectDetail) {
  return {
    ...toProjectScalars(project),
    publishStatus: project.publishStatus,
    images:       project.images.map((img) => ({ sectionKey: img.sectionKey, url: img.url, altText: img.altText, sortOrder: img.sortOrder })),
    contentItems: project.contentItems.map((item) => ({ groupKey: item.groupKey, itemKey: item.itemKey, title: item.title, body: item.body, meta: item.meta, accent: item.accent, state: item.state, sortOrder: item.sortOrder })),
    modules:      project.modules.map((m) => ({ id: m.id, moduleType: m.moduleType, sortOrder: m.sortOrder, isVisible: m.isVisible, settings: m.settings })),
  }
}

function toLiveTemplate(project: ProjectDetail): TongchuangTemplateContent | ShangAnTemplateContent {
  const images = project.images.map((img) => ({
    sectionKey: img.sectionKey,
    url: img.url,
    altText: img.altText,
    sortOrder: img.sortOrder ?? 0,
  }))

  if (project.templateKey === 'shop') {
    return buildShangAnTemplateContent(
      {
        id:               project.id,
        slug:             project.slug,
        publishStatus:    project.publishStatus,
        name:             project.name,
        subtitle:         project.subtitle,
        overviewTitle:    project.overviewTitle,
        overviewBody:     project.overviewBody,
        contactTitle:     project.contactTitle,
        contactBody:      project.contactBody,
        salesPhone:       project.salesPhone,
        footerDisclaimer: project.footerDisclaimer,
      },
      images,
      project.contentItems,
      project.modules,
    )
  }

  return buildTongchuangTemplateContent(
    {
      id:                     project.id,
      slug:                   project.slug,
      publishStatus:          project.publishStatus,
      name:                   project.name,
      subtitle:               project.subtitle,
      districtLabel:          project.districtLabel,
      completionBadge:        project.completionBadge,
      overviewTitle:          project.overviewTitle,
      overviewBody:           project.overviewBody,
      featuresTitle:          project.featuresTitle,
      progressTitle:          project.progressTitle,
      progressCompletionText: project.progressCompletionText,
      locationTitle:          project.locationTitle,
      contactTitle:           project.contactTitle,
      contactBody:            project.contactBody,
      salesPhone:             project.salesPhone,
      footerDisclaimer:       project.footerDisclaimer,
      mapLat:                 project.mapLat,
      mapLng:                 project.mapLng,
      mapZoom:                project.mapZoom,
    },
    images,
    project.contentItems,
    project.modules,
  )
}

function replaceImage(images: ProjectImage[], next: ProjectImage): ProjectImage[] {
  return [...images.filter((img) => img.sectionKey !== next.sectionKey), next]
}
