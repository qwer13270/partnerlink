'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Monitor, Save, Smartphone, Sparkles, Trash2 } from 'lucide-react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useEditor }         from './_use-editor'
import { SectionPanel }      from './_panels'
import { ModuleListItem, PinnedModuleItem, DraggableModuleItem } from './_module-list'
import { MODULE_META } from './_types'
import { typeLabel } from '@/lib/merchant-application'
import { ThemePicker, FontPicker } from './_theme-font-picker'
import { ModulePicker } from './_module-picker'
import { AiImportPanel, AiImportBanner } from './_ai-import'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

export default function EditProjectPage() {
  const { id }          = useParams<{ id: string }>()
  const searchParams    = useSearchParams()
  const isNewProject    = searchParams.get('new') === '1'
  const editor          = useEditor(id)

  const {
    draftProject, liveTemplate, selectedModule,
    normalModules, pinnedModules,
    loading, saving, publishing, isDirty,
    sidebarView,
    setSidebarView,
    handleSave, handleConfirmLeave,
    pendingLeavePath, confirmLeave, cancelLeave,
    updateProjectField, updateContentItem, updateModule,
    toggleModuleVisibility, reorderModules,
    addModule, removeModule, selectModule,
    handleImageUpload, handleImageDelete,
    currentTheme, currentFont, setColorTheme, setFontTheme,
    applyAiExtract,
  } = editor

  const AI_USED_KEY = `ai-import-used-${id}`
  const [aiImportUsed,  setAiImportUsed]  = useState(() => typeof window !== 'undefined' && !!localStorage.getItem(`ai-import-used-${id}`))
  const [showAiBanner,  setShowAiBanner]  = useState(isNewProject && !aiImportUsed)
  const [aiPanelOpen,   setAiPanelOpen]   = useState(false)

  function markAiImportUsed() {
    localStorage.setItem(AI_USED_KEY, '1')
    setAiImportUsed(true)
    setShowAiBanner(false)
    setAiPanelOpen(false)
  }

  const existingModuleTypes = useMemo(
    () => new Set(draftProject?.modules.map((m) => m.moduleType) ?? []),
    [draftProject?.modules],
  )

  const iframeRef  = useRef<HTMLIFrameElement>(null)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [iframeReady, setIframeReady] = useState(false)
  const [iframeContentReady, setIframeContentReady] = useState(false)
  const firstSendDone = useRef(false)

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
    // On the very first send, wait a tick for the iframe to render then drop the overlay
    if (!firstSendDone.current) {
      firstSendDone.current = true
      setTimeout(() => setIframeContentReady(true), 200)
    }
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

      {/* ── Overlay — hides blank iframe until first content render ────────── */}
      {!iframeContentReady && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">載入商案內容中…</p>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-foreground/10 bg-background/98 backdrop-blur-md">
        <div className="flex items-center gap-4 px-5 py-4 lg:px-6">
          <button
            type="button"
            onClick={() => handleConfirmLeave(`/merchant/projects/${id}/customers`)}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 text-muted-foreground transition-colors duration-150 hover:bg-foreground/5 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs">返回{typeLabel(draftProject.templateKey ?? 'property')}</span>
          </button>

          <div className="h-6 w-px shrink-0 bg-foreground/10" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm leading-snug text-foreground">{draftProject.name}</p>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{typeLabel(draftProject.templateKey ?? 'property')}編輯器</p>
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
            {draftProject?.templateKey === 'shop' && (
              <Link
                href={`/merchant/projects/${id}/products`}
                className="hidden h-9 items-center gap-2 rounded-lg border border-foreground/15 px-3.5 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-150 hover:border-foreground/30 hover:text-foreground sm:inline-flex"
              >
                商品
              </Link>
            )}
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

            {/* AI Import panel */}
            {aiPanelOpen && (
              <motion.div
                key="ai"
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <AiImportPanel
                  onApply={(data) => { applyAiExtract(data); markAiImportUsed() }}
                  onClose={() => setAiPanelOpen(false)}
                />
              </motion.div>
            )}

            {/* List / Theme views — share the same slide-in panel */}
            {!aiPanelOpen && (sidebarView === 'list' || sidebarView === 'theme' || sidebarView === 'font') && (
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
                    {([['list', '模塊'], ['theme', '顏色'], ['font', '字型']] as const).map(([view, label]) => {
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
                      <div className="min-h-0 flex-1 overflow-y-auto">
                        {/* AI import area — only for property type */}
                        {draftProject?.templateKey === 'property' && (
                          <AnimatePresence mode="wait" initial={false}>
                            {aiImportUsed ? (
                              /* ── Used state ── */
                              <motion.div
                                key="used"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="mx-3 mt-3 mb-2"
                              >
                                <div className="flex items-center gap-2 rounded-lg border border-foreground/[0.06] bg-foreground/[0.02] px-3 py-2">
                                  <Sparkles className="h-3 w-3 shrink-0 text-muted-foreground/25" />
                                  <span className="flex-1 text-[0.68rem] uppercase tracking-[0.25em] text-muted-foreground/35">AI 已匯入</span>
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60 shrink-0" />
                                </div>
                              </motion.div>
                            ) : showAiBanner ? (
                              /* ── First-visit banner ── */
                              <motion.div key="banner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <AiImportBanner
                                  onOpen={() => setAiPanelOpen(true)}
                                  onDismiss={() => setShowAiBanner(false)}
                                />
                              </motion.div>
                            ) : (
                              /* ── Compact button ── */
                              <motion.div
                                key="button"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="mx-3 mt-3 mb-2"
                              >
                                <button
                                  type="button"
                                  onClick={() => setAiPanelOpen(true)}
                                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#C9A96E]/30 bg-[#C9A96E]/[0.05] px-3 py-2 text-[0.72rem] uppercase tracking-[0.25em] text-[#8b6d3d] transition-all hover:bg-[#C9A96E]/[0.10] hover:border-[#C9A96E]/50"
                                >
                                  <Sparkles className="h-3 w-3" />
                                  AI 匯入
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}

                        <div className="px-3 py-3">
                        {(() => {
                          // color_theme is managed via the 顏色 / 字型 tabs — hide it from the drag list.
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
                                  actionHref={module.moduleType === 'shop_products' ? `/merchant/projects/${id}/products` : undefined}
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
                        </div>{/* end px-3 py-3 */}
                      </div>

                      <ModulePicker
                        existingTypes={existingModuleTypes}
                        templateKey={draftProject?.templateKey ?? 'property'}
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

                  {sidebarView === 'font' && (
                    <motion.div
                      key="font"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="flex min-h-0 flex-1 flex-col overflow-hidden"
                    >
                      <FontPicker currentFont={currentFont} onSelect={setFontTheme} />
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
                    className="mb-3 flex items-center gap-2 rounded-lg bg-black/[0.05] px-3 py-2 text-[0.78rem] font-medium text-foreground/60 transition-all duration-150 hover:bg-black/[0.09] hover:text-foreground active:scale-[0.97]"
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
                    fallbackImages={'images' in liveTemplate ? liveTemplate.images : {} as never}
                    imageBreaks={'imageBreaks' in liveTemplate ? liveTemplate.imageBreaks : {}}
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

      {/* ── Unsaved changes dialog ───────────────────────────────────────────── */}
      <Dialog open={!!pendingLeavePath} onOpenChange={(open) => { if (!open) cancelLeave() }}>
        <DialogContent showCloseButton={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>離開前確認</DialogTitle>
            <DialogDescription>你有尚未儲存的變更，離開後將會遺失。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={cancelLeave}
              className="inline-flex h-9 items-center rounded-lg border border-foreground/20 px-4 text-sm transition-colors hover:bg-foreground/5"
            >
              繼續編輯
            </button>
            <button
              type="button"
              onClick={confirmLeave}
              className="inline-flex h-9 items-center rounded-lg bg-foreground px-4 text-sm text-background transition-opacity hover:opacity-80"
            >
              離開不儲存
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
