'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Monitor, Plus, Save, Smartphone, Trash2 } from 'lucide-react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { useEditor }         from './_use-editor'
import { SectionPanel }      from './_panels'
import { ModuleListItem, PinnedModuleItem } from './_module-list'
import { MODULE_META } from './_types'
import type { PropertyModule } from './_types'
import { PROPERTY_THEMES, type PropertyModuleType, type PropertyThemeKey } from '@/lib/property-template'

// ── Theme metadata ────────────────────────────────────────────────────────────

const THEME_META: Record<PropertyThemeKey, { zh: string; en: string }> = {
  'dark-gold':  { zh: '暗金', en: 'Dark Gold'  },
  'ivory':      { zh: '象牙', en: 'Ivory'      },
  'graphite':   { zh: '石墨', en: 'Graphite'   },
  'vermillion': { zh: '暗朱', en: 'Vermillion' },
  'cloud':      { zh: '雲霧', en: 'Cloud'      },
}

function ThemePicker({
  currentTheme,
  onSelect,
}: {
  currentTheme: PropertyThemeKey
  onSelect: (key: PropertyThemeKey) => void
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="px-4 py-4">
        <p className="mb-4 text-xs uppercase tracking-[0.4em] text-muted-foreground/50">
          選擇色彩主題
        </p>
        <div className="space-y-1.5">
          {(Object.entries(PROPERTY_THEMES) as [PropertyThemeKey, (typeof PROPERTY_THEMES)[PropertyThemeKey]][]).map(
            ([key, vars]) => {
              const selected = currentTheme === key
              const { zh, en } = THEME_META[key]
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelect(key)}
                  className={[
                    'group relative flex w-full items-center gap-3 rounded-sm border px-3 py-3 text-left transition-all duration-200',
                    selected
                      ? 'border-foreground/30 bg-foreground/[0.03]'
                      : 'border-foreground/[0.06] hover:border-foreground/[0.15] hover:bg-foreground/[0.015]',
                  ].join(' ')}
                >
                  {/* Selected accent bar */}
                  <div
                    className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0'}`}
                    style={{ background: vars['--p-accent'] }}
                  />

                  {/* Colour swatch — bg / card / accent / text bands */}
                  <div className="flex h-9 w-[4.5rem] flex-none overflow-hidden rounded-sm shadow-sm">
                    <div className="flex-[4]" style={{ background: vars['--p-bg'] }} />
                    <div className="flex-[2]" style={{ background: vars['--p-bg-card'] }} />
                    <div className="flex-[3]" style={{ background: vars['--p-accent'] }} />
                    <div className="flex-[1]" style={{ background: vars['--p-text'] }} />
                  </div>

                  {/* Name */}
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.8rem] font-medium leading-none">{zh}</p>
                    <p className="mt-1.5 text-xs uppercase tracking-[0.3em] text-muted-foreground/50">{en}</p>
                  </div>

                  {/* Checkmark */}
                  {selected && (
                    <svg className="h-3 w-3 shrink-0 text-foreground/50" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              )
            },
          )}
        </div>
      </div>
    </div>
  )
}

// ── Module picker ─────────────────────────────────────────────────────────────

const MODULE_TYPE_ORDER: PropertyModuleType[] = [
  'intro_identity', 'intro_specs', 'features',
  'progress', 'location', 'surroundings', 'team', 'indoor_commons', 'contact', 'footer', 'image_section', 'floor_plan',
]

function ModulePicker({
  existingTypes,
  onAdd,
}: {
  existingTypes: Set<PropertyModuleType>
  onAdd: (type: PropertyModuleType) => void
}) {
  const [open, setOpen] = useState(false)

  // Only show modules that can actually be added: image_section always, singletons only if not yet added
  const addable = MODULE_TYPE_ORDER.filter(
    (t) => t === 'image_section' || !existingTypes.has(t),
  )

  return (
    <div className="shrink-0 border-t border-foreground/[0.07]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors duration-150 hover:bg-foreground/[0.02]"
      >
        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 ${
          open
            ? 'border-foreground/30 bg-foreground/[0.05] text-foreground'
            : 'border-foreground/12 bg-foreground/[0.03] text-muted-foreground group-hover:border-foreground/25 group-hover:text-foreground'
        }`}>
          <Plus className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-45' : ''}`} />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/60 group-hover:text-foreground/80">
          新增模塊
        </p>
        {addable.length === 1 && (
          <span className="ml-auto text-xs text-muted-foreground/40">僅剩圖片區塊</span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-1.5 px-3 pb-3">
              {addable.map((type) => {
                const meta = MODULE_META[type]
                const isMulti = type === 'image_section'
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { onAdd(type); setOpen(false) }}
                    className="group flex items-center gap-2 rounded-md border border-foreground/12 bg-foreground/[0.04] px-2.5 py-2 text-left transition-all duration-150 hover:border-foreground/25 hover:bg-foreground/[0.08]"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-foreground/[0.06] text-foreground/50 transition-colors duration-150 group-hover:bg-foreground/[0.12] group-hover:text-foreground">
                      <meta.Icon className="h-3 w-3" />
                    </div>
                    <span className="truncate text-xs text-foreground/65 transition-colors duration-150 group-hover:text-foreground">
                      {meta.label}
                    </span>
                    {isMulti && (
                      <span className="ml-auto shrink-0 rounded-sm bg-[#C9A96E]/12 px-1 py-px text-xs uppercase tracking-wider text-[#C9A96E]/70">
                        可多個
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Draggable item wrapper (Framer Motion Reorder + drag controls) ────────────

function DraggableModuleItem({
  module,
  selected,
  onSelect,
  onToggleVisibility,
}: {
  module: PropertyModule
  selected: boolean
  onSelect: () => void
  onToggleVisibility: () => void
}) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={module}
      dragControls={controls}
      dragListener={false}
      as="div"
      className="list-none"
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
        borderRadius: '8px',
        zIndex: 10,
        backgroundColor: 'hsl(var(--background))',
      }}
      transition={{ duration: 0.15 }}
    >
      <ModuleListItem
        module={module}
        selected={selected}
        onSelect={onSelect}
        onToggleVisibility={onToggleVisibility}
        onDragHandlePointerDown={(e) => controls.start(e)}
      />
    </Reorder.Item>
  )
}

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>()
  const editor  = useEditor(id)

  const {
    draftProject, liveTemplate, selectedModule,
    normalModules, pinnedModules,
    loading, saving, publishing, isDirty,
    showDeleteModal, deleting,
    sidebarView,
    setShowDeleteModal, setSidebarView,
    handleSave, handleDelete, handleConfirmLeave,
    updateProjectField, updateContentItem, updateModule,
    toggleModuleVisibility, reorderModules,
    addModule, removeModule, selectModule,
    handleImageUpload, handleImageDelete,
    currentTheme, setColorTheme,
  } = editor

  const iframeRef  = useRef<HTMLIFrameElement>(null)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [iframeReady, setIframeReady] = useState(false)

  // ── Listen for messages from iframe ───────────────────────────────────────
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (e.data?.type === 'ready') setIframeReady(true)
      if (e.data?.type === 'select') selectModule(e.data.moduleId as string)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [selectModule])

  // ── Push live template to iframe whenever it changes ──────────────────────
  useEffect(() => {
    if (!iframeReady || !liveTemplate) return
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'update', content: liveTemplate, selectedModuleId: selectedModule?.id ?? null },
      '*',
    )
  }, [iframeReady, liveTemplate, selectedModule?.id])

  // ── Loading / not-found states ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">載入商案內容中…</p>
      </div>
    )
  }

  if (!draftProject || !liveTemplate) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">找不到這個商案。</p>
      </div>
    )
  }

  const isPublished = draftProject.publishStatus === 'published'

  function scrollPreviewToModule(moduleId: string) {
    iframeRef.current?.contentWindow?.postMessage({ type: 'scroll', moduleId }, '*')
  }

  function selectModuleAndScroll(moduleId: string) {
    selectModule(moduleId)
    setTimeout(() => scrollPreviewToModule(moduleId), 50)
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#f0ece4]">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-foreground/10 bg-background/98 backdrop-blur-md">
        <div className="flex items-center gap-4 px-5 py-4 lg:px-6">
          <button
            type="button"
            onClick={() => handleConfirmLeave('/merchant/projects')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-foreground/5 hover:text-foreground"
            aria-label="離開編輯器"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>

          <div className="h-6 w-px shrink-0 bg-foreground/10" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm leading-snug text-foreground">{draftProject.name}</p>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">商案編輯器</p>
          </div>

          {/* Status badges */}
          <div className="flex shrink-0 items-center gap-2">
            <span className={`hidden rounded px-2.5 py-1 text-xs uppercase tracking-widest sm:inline-block ${
              isPublished
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
            }`}>
              {isPublished ? '已發布' : '草稿'}
            </span>
            {isDirty && (
              <span className="hidden rounded bg-[#C9A96E]/10 px-2.5 py-1 text-xs uppercase tracking-widest text-[#8b6d3d] ring-1 ring-[#C9A96E]/30 sm:inline-block">
                未儲存
              </span>
            )}
          </div>

          {/* View mode toggle */}
          <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-foreground/10 bg-foreground/[0.03] p-1">
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              title="桌機檢視"
              className={`flex h-7 w-9 items-center justify-center rounded-md transition-colors duration-150 ${
                viewMode === 'desktop'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              title="手機檢視"
              className={`flex h-7 w-9 items-center justify-center rounded-md transition-colors duration-150 ${
                viewMode === 'mobile'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="hidden h-9 items-center gap-2 rounded-lg border border-red-200/70 px-3.5 text-xs uppercase tracking-[0.3em] text-red-500/70 transition-colors duration-150 hover:border-red-400 hover:text-red-500 sm:inline-flex"
            >
              <Trash2 className="h-3.5 w-3.5" />
              刪除
            </button>
            <Link
              href={`/merchant/projects/${id}/preview`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 items-center gap-2 rounded-lg border border-foreground/15 px-3.5 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-150 hover:border-foreground/30 hover:text-foreground sm:inline-flex"
            >
              <Eye className="h-3.5 w-3.5" />
              預覽
            </Link>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || publishing || !isDirty}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-5 text-xs uppercase tracking-[0.3em] text-background transition-opacity duration-150 hover:bg-foreground/85 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? '儲存中…' : '儲存'}
            </button>
            {!isPublished && (
              <button
                type="button"
                onClick={() => void handleSave('published')}
                disabled={saving || publishing}
                className="hidden h-9 items-center gap-2 rounded-lg border border-foreground px-5 text-xs uppercase tracking-[0.3em] text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background disabled:opacity-30 lg:inline-flex"
              >
                {publishing ? '發布中…' : '立即發布'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main area ─────────────────────────────────────────────────────────── */}
      <div className="grid min-h-0 flex-1 grid-cols-[380px_1fr] overflow-hidden">

        {/* ── Left sidebar ── */}
        <aside className="relative flex min-h-0 flex-col overflow-hidden border-r border-foreground/10 bg-background">
          <AnimatePresence mode="wait" initial={false}>

            {/* List / Theme views — share the same slide-in panel */}
            {(sidebarView === 'list' || sidebarView === 'theme') && (
              <motion.div
                key="list"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-h-0 flex-1 flex-col"
              >
                {/* Tab header */}
                <div className="shrink-0 border-b border-foreground/[0.07] px-5 pt-4">
                  <div className="flex items-center">
                    {([['list', '模塊'], ['theme', '顏色']] as const).map(([view, label]) => {
                      const active = sidebarView === view
                      return (
                        <button
                          key={view}
                          type="button"
                          onClick={() => setSidebarView(view)}
                          className={`relative mr-5 pb-3.5 text-xs uppercase tracking-[0.3em] transition-colors duration-150 ${
                            active ? 'text-foreground' : 'text-muted-foreground/40 hover:text-muted-foreground/70'
                          }`}
                        >
                          {label}
                          {active && (
                            <motion.div
                              layoutId="sidebar-tab-line"
                              className="absolute bottom-0 left-0 right-0 h-px bg-foreground"
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Tab content — inner fade transition */}
                <AnimatePresence mode="wait" initial={false}>
                  {sidebarView === 'list' && (
                    <motion.div
                      key="modules"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="flex min-h-0 flex-1 flex-col"
                    >
                      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                        {(() => {
                          // color_theme is managed via the 顏色 tab — hide it from the drag list.
                          // Reorder.Group requires values to exactly match rendered items, so we
                          // filter BOTH values and children, then re-append hidden modules when
                          // calling reorderModules so they are never dropped from state.
                          const hiddenModules = normalModules.filter((m) => m.moduleType === 'color_theme')
                          const displayModules = normalModules.filter((m) => m.moduleType !== 'color_theme')
                          return (
                            <Reorder.Group
                              axis="y"
                              values={displayModules}
                              onReorder={(reordered) => reorderModules([...reordered, ...hiddenModules])}
                              className="space-y-1"
                              as="div"
                            >
                              {displayModules.map((module) => (
                                <DraggableModuleItem
                                  key={module.id}
                                  module={module}
                                  selected={module.id === editor.selectedModule?.id}
                                  onSelect={() => selectModuleAndScroll(module.id)}
                                  onToggleVisibility={() => toggleModuleVisibility(module.id)}
                                />
                              ))}
                            </Reorder.Group>
                          )
                        })()}

                        {pinnedModules.length > 0 && (
                          <div className="mt-4">
                            <div className="mb-2 flex items-center gap-2 px-2">
                              <div className="h-px flex-1 bg-foreground/[0.07]" />
                              <span className="shrink-0 text-xs uppercase tracking-[0.3em] text-muted-foreground/40">固定</span>
                              <div className="h-px flex-1 bg-foreground/[0.07]" />
                            </div>
                            <div className="space-y-1">
                              {pinnedModules.map((module) => (
                                <PinnedModuleItem
                                  key={module.id}
                                  module={module}
                                  selected={module.id === editor.selectedModule?.id}
                                  onSelect={() => selectModuleAndScroll(module.id)}
                                  onToggleVisibility={() => toggleModuleVisibility(module.id)}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <ModulePicker
                        existingTypes={new Set(draftProject.modules.map((m) => m.moduleType))}
                        onAdd={(type) => { const newId = addModule(type); if (newId) setTimeout(() => scrollPreviewToModule(newId), 80) }}
                      />
                    </motion.div>
                  )}

                  {sidebarView === 'theme' && (
                    <motion.div
                      key="theme"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="flex min-h-0 flex-1 flex-col overflow-hidden"
                    >
                      <ThemePicker currentTheme={currentTheme} onSelect={setColorTheme} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Edit view */}
            {sidebarView === 'edit' && selectedModule && (
              <motion.div
                key="edit"
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-h-0 flex-1 flex-col"
              >
                {/* Edit header */}
                <div className="shrink-0 border-b border-foreground/[0.07] px-4 pb-3.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setSidebarView('list')}
                    className="mb-3 flex items-center gap-2 rounded-md border border-foreground/10 bg-foreground/[0.03] px-3 py-2 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-150 hover:border-foreground/20 hover:bg-foreground/[0.06] hover:text-foreground"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    所有模塊
                  </button>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      {(() => {
                        const { Icon, label, desc } = MODULE_META[selectedModule.moduleType]
                        return (
                          <>
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground/[0.04] text-foreground/50">
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium leading-tight">{label}</p>
                              <p className="truncate text-xs text-muted-foreground">{desc}</p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleModuleVisibility(selectedModule.id)}
                        className={`rounded-sm px-2 py-1 text-xs uppercase tracking-[0.3em] transition-colors duration-150 ${
                          selectedModule.isVisible
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100'
                            : 'bg-muted/60 text-muted-foreground ring-1 ring-foreground/12 hover:bg-muted'
                        }`}
                      >
                        {selectedModule.isVisible
                          ? <span className="flex items-center gap-1"><Eye className="h-3 w-3" />顯示</span>
                          : <span className="flex items-center gap-1"><EyeOff className="h-3 w-3" />隱藏</span>
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => removeModule(selectedModule.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/40 transition-colors duration-150 hover:bg-red-50 hover:text-red-500"
                        title="刪除模塊"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Edit fields */}
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  <SectionPanel
                    project={draftProject}
                    module={selectedModule}
                    uploadingSlot={editor.uploadingSlot}
                    fallbackImages={liveTemplate.images}
                    imageBreaks={liveTemplate.imageBreaks}
                    onFieldChange={updateProjectField}
                    onContentItemChange={updateContentItem}
                    onModuleChange={updateModule}
                    onModuleRemove={removeModule}
                    onImageUpload={handleImageUpload}
                    onImageDelete={handleImageDelete}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* ── Preview ── */}
        <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto bg-[#d9d1c5] p-4 lg:p-6 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          <div className={`w-full overflow-hidden transition-all duration-300 ${
            viewMode === 'mobile'
              ? 'max-w-[390px] rounded-[40px] border-[6px] border-black/80 shadow-[0_30px_90px_rgba(0,0,0,0.30)]'
              : 'max-w-[1280px] rounded-[28px] border border-black/10 shadow-[0_30px_90px_rgba(0,0,0,0.18)]'
          } bg-[#0D0D0E]`}>
            <iframe
              ref={iframeRef}
              src={`/merchant/projects/${id}/frame`}
              className="block w-full"
              style={{ height: viewMode === 'mobile' ? '844px' : '100vh', minHeight: 600 }}
              title="預覽"
              onLoad={() => {
                // Re-send content on iframe reload
                if (liveTemplate) {
                  iframeRef.current?.contentWindow?.postMessage(
                    { type: 'update', content: liveTemplate, selectedModuleId: selectedModule?.id ?? null },
                    '*',
                  )
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
            onClick={() => { if (!deleting) setShowDeleteModal(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm rounded-xl border border-foreground/10 bg-background p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">刪除商案</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    確定要刪除「{draftProject.name}」？此操作無法復原，所有內容與圖片將一併刪除。
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="rounded-md border border-foreground/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-150 hover:border-foreground hover:text-foreground disabled:opacity-30"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                  className="rounded-md bg-red-500 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white transition-colors duration-150 hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? '刪除中…' : '確認刪除'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
