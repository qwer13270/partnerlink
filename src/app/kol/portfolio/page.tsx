'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, ImagePlus, LoaderCircle, Play, Trash2, UploadCloud, X } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────
type PortfolioAsset = {
  id: string
  mediaType: 'image' | 'video'
  url: string
  fileName: string
  sortOrder: number
  mimeType: string
  fileSizeBytes: number
  createdAt: string
}

type UploadState = {
  key: string
  fileName: string
  mediaType: 'image' | 'video'
  progress: number
  status: 'uploading' | 'error'
  error?: string
}

type PortfolioResponse = {
  portfolio?: {
    photos: PortfolioAsset[]
    videos: PortfolioAsset[]
    summary: { totalPhotos: number; totalVideos: number }
  }
  asset?: PortfolioAsset
  error?: string
}

type GalleryTab = 'photos' | 'videos'

// ── Helpers ────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function formatBytes(value: number) {
  if (!value) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
  const size = value / 1024 ** index
  return `${size >= 10 || index === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[index]}`
}

function uploadPortfolioFile({
  file, mediaType, sortOrder, onProgress,
}: {
  file: File; mediaType: 'image' | 'video'; sortOrder: number
  onProgress: (progress: number) => void
}) {
  const formData = new FormData()
  formData.append('mediaType', mediaType)
  formData.append('sortOrder', String(sortOrder))
  formData.append('file', file)

  return new Promise<PortfolioAsset>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/kol/portfolio')
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)))
    }
    xhr.onerror = () => reject(new Error('上傳失敗，請檢查網路後再試。'))
    xhr.onabort = () => reject(new Error('上傳已中止。'))
    xhr.onload = () => {
      const payload = JSON.parse(xhr.responseText || '{}') as PortfolioResponse
      if (xhr.status >= 200 && xhr.status < 300 && payload.asset) {
        resolve(payload.asset)
        return
      }
      reject(new Error(payload.error ?? `上傳失敗（${xhr.status}）`))
    }
    xhr.send(formData)
  })
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function KolPortfolioPage() {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const dragCounter   = useRef(0)

  const [photos,          setPhotos]          = useState<PortfolioAsset[]>([])
  const [videos,          setVideos]          = useState<PortfolioAsset[]>([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState('')
  const [uploadStates,    setUploadStates]    = useState<UploadState[]>([])
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null)
  const [activeTab,       setActiveTab]       = useState<GalleryTab>('photos')
  const [previewVideoId,  setPreviewVideoId]  = useState<string | null>(null)
  const [isDragging,      setIsDragging]      = useState(false)

  const totalAssets = photos.length + videos.length

  const statCards = useMemo(() => ([
    { label: '照片', value: photos.length.toString().padStart(2, '0') },
    { label: '影片', value: videos.length.toString().padStart(2, '0') },
    { label: '完整度', value: totalAssets > 0 ? '已啟用' : '待補齊' },
  ]), [photos.length, videos.length, totalAssets])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    fetch('/api/kol/portfolio', { cache: 'no-store' })
      .then(async (res) => {
        const payload = (await res.json().catch(() => null)) as PortfolioResponse | null
        if (!res.ok) { if (active) setError(payload?.error ?? '讀取作品集失敗。'); return }
        if (!active) return
        setPhotos(payload?.portfolio?.photos ?? [])
        setVideos(payload?.portfolio?.videos ?? [])
      })
      .catch((e) => { if (active) setError(e instanceof Error ? e.message : '讀取作品集失敗。') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const upsertUpload = (s: UploadState) =>
    setUploadStates((prev) => {
      const i = prev.findIndex((x) => x.key === s.key)
      if (i === -1) return [...prev, s]
      const next = [...prev]; next[i] = s; return next
    })

  const removeUpload = (key: string) =>
    setUploadStates((prev) => prev.filter((s) => s.key !== key))

  const handleFilesSelected = async (mediaType: 'image' | 'video', files: File[]) => {
    if (files.length === 0) return
    setError('')
    const baseCount = mediaType === 'image' ? photos.length : videos.length
    for (const [index, file] of files.entries()) {
      const key = `${mediaType}-${file.name}-${file.size}-${crypto.randomUUID()}`
      upsertUpload({ key, fileName: file.name, mediaType, progress: 0, status: 'uploading' })
      try {
        const asset = await uploadPortfolioFile({
          file, mediaType, sortOrder: baseCount + index,
          onProgress: (progress) => upsertUpload({ key, fileName: file.name, mediaType, progress, status: 'uploading' }),
        })
        if (mediaType === 'image') setPhotos((prev) => [...prev, asset].sort((a, b) => a.sortOrder - b.sortOrder))
        else setVideos((prev) => [...prev, asset].sort((a, b) => a.sortOrder - b.sortOrder))
        removeUpload(key)
      } catch (e) {
        const msg = e instanceof Error ? e.message : '上傳失敗'
        upsertUpload({ key, fileName: file.name, mediaType, progress: 0, status: 'error', error: msg })
        setError(msg)
      }
    }
  }

  const handleDelete = async (asset: PortfolioAsset) => {
    setDeletingAssetId(asset.id)
    setError('')
    try {
      const res = await fetch('/api/kol/portfolio', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: asset.id }),
      })
      const payload = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) { setError(payload?.error ?? '刪除失敗，請稍後再試。'); return }
      if (asset.mediaType === 'image') setPhotos((prev) => prev.filter((x) => x.id !== asset.id))
      else setVideos((prev) => prev.filter((x) => x.id !== asset.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : '刪除失敗，請稍後再試。')
    } finally {
      setDeletingAssetId(null)
    }
  }

  // Drag-and-drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setIsDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault() }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const images = files.filter((f) => f.type.startsWith('image/'))
    const vids   = files.filter((f) => f.type.startsWith('video/'))
    if (images.length > 0) void handleFilesSelected('image', images)
    if (vids.length > 0)   void handleFilesSelected('video', vids)
  }

  // Gallery filtered content
  const showPhotos = activeTab === 'photos'
  const showVideos = activeTab === 'videos'

  const tabs: { id: GalleryTab; label: string; count: number }[] = [
    { id: 'photos', label: '照片', count: photos.length },
    { id: 'videos', label: '影片', count: videos.length },
  ]

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.4em] text-muted-foreground mb-1.5">作品集管理</p>
          <h1 className="text-3xl font-serif leading-tight">把你的作品整理成<br className="sm:hidden" />商家一眼看懂的門面。</h1>
        </div>

        {/* Inline stat strip */}
        <div className="flex items-stretch gap-px border border-foreground/10 shrink-0">
          {statCards.map((s) => (
            <div key={s.label} className="px-5 py-3 bg-background flex flex-col items-center gap-0.5 min-w-[72px]">
              <p className="text-xl font-serif leading-none tracking-tight">{s.value}</p>
              <p className="text-[0.58rem] uppercase tracking-[0.25em] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Upload zone ── */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative overflow-hidden transition-all duration-200"
          style={{
            border: `2px dashed ${isDragging ? '#B5886C' : 'rgba(26,26,26,0.15)'}`,
            backgroundColor: isDragging ? 'rgba(181,136,108,0.06)' : '#F7F3EE',
          }}
        >
          {/* Dot grid texture */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-[0.35]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(26,26,26,0.18) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative flex flex-col items-center justify-center gap-5 py-12 px-6 text-center">
            <motion.div
              animate={{ scale: isDragging ? 1.15 : 1, opacity: isDragging ? 1 : 0.45 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <UploadCloud
                className="h-10 w-10"
                style={{ color: isDragging ? '#B5886C' : '#1A1A1A' }}
              />
            </motion.div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {isDragging ? '放開以上傳' : '拖拉照片或影片到此處'}
              </p>
              <p className="text-xs text-muted-foreground">照片與影片皆可，自動辨識格式</p>
            </div>

            {/* Upload buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="inline-flex items-center gap-2 border border-foreground/20 bg-white px-4 py-2 text-xs uppercase tracking-widest text-foreground/70 hover:border-foreground/40 hover:text-foreground transition-all duration-150"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                上傳照片
              </button>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="inline-flex items-center gap-2 border border-foreground/20 bg-white px-4 py-2 text-xs uppercase tracking-widest text-foreground/70 hover:border-foreground/40 hover:text-foreground transition-all duration-150"
              >
                <Film className="h-3.5 w-3.5" />
                上傳影片
              </button>
            </div>

            <p className="text-[0.6rem] text-muted-foreground/60 tracking-wide">
              JPG / PNG，上限 10 MB　·　MP4 / MOV，上限 100 MB
            </p>
          </div>
        </div>

        {/* Hidden inputs */}
        <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => { void handleFilesSelected('image', Array.from(e.target.files ?? [])); e.target.value = '' }} />
        <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden"
          onChange={(e) => { void handleFilesSelected('video', Array.from(e.target.files ?? [])); e.target.value = '' }} />
      </motion.div>

      {/* ── Upload progress ── */}
      <AnimatePresence>
        {uploadStates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            {uploadStates.map((state) => (
              <div key={state.key} className="border border-foreground/10 bg-background px-4 py-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {state.status === 'uploading'
                      ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-muted-foreground shrink-0" />
                      : <span className="w-3.5 h-3.5 shrink-0 text-red-500 text-xs">✕</span>
                    }
                    <p className="truncate text-xs font-medium">{state.fileName}</p>
                  </div>
                  <p className={`text-[0.62rem] uppercase tracking-wider shrink-0 ${state.status === 'error' ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {state.status === 'uploading' ? `${state.progress}%` : '失敗'}
                  </p>
                </div>
                <div className="h-px bg-foreground/8">
                  <div
                    className={`h-full transition-all duration-200 ${state.status === 'error' ? 'bg-red-500' : 'bg-foreground'}`}
                    style={{ width: `${state.status === 'error' ? 100 : state.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-sm text-red-600 border border-red-200 bg-red-50 px-4 py-2.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Gallery ── */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>

        {/* Tab bar */}
        <div className="flex items-end gap-0 border-b border-foreground/10 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-2.5 text-xs uppercase tracking-[0.25em] transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground/70'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 text-[0.55rem] ${activeTab === tab.id ? 'text-foreground/50' : 'text-muted-foreground/50'}`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-px bg-foreground"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {/* ── Photos ── */}
          {showPhotos && (
            <div>
              {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-square animate-pulse bg-muted/40" />
                  ))}
                </div>
              ) : photos.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center gap-4 py-16 border border-dashed border-foreground/15 cursor-pointer hover:border-foreground/25 transition-colors"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-foreground/70">還沒有作品照片</p>
                    <p className="text-xs text-muted-foreground">點擊或拖拉照片到此處上傳</p>
                  </div>
                </div>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {photos.map((photo) => (
                    <motion.div
                      key={photo.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative aspect-square overflow-hidden bg-[#F0EBE4]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.fileName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors duration-200" />
                      {/* File info — shown on hover */}
                      <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="truncate text-[0.65rem] text-white font-medium">{photo.fileName}</p>
                        <p className="text-[0.58rem] text-white/60 mt-0.5">{formatBytes(photo.fileSizeBytes)}</p>
                      </div>
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => void handleDelete(photo)}
                        disabled={deletingAssetId === photo.id}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100 hover:bg-red-600/80"
                      >
                        {deletingAssetId === photo.id
                          ? <LoaderCircle className="h-3 w-3 animate-spin" />
                          : <Trash2 className="h-3 w-3" />}
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* ── Videos ── */}
          {showVideos && (
            <div>
              {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-20 animate-pulse bg-muted/40" />
                    ))}
                  </div>
                ) : videos.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center gap-4 py-16 border border-dashed border-foreground/15 cursor-pointer hover:border-foreground/25 transition-colors"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <Film className="h-8 w-8 text-muted-foreground/40" />
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-foreground/70">還沒有作品影片</p>
                      <p className="text-xs text-muted-foreground">點擊或拖拉影片到此處上傳</p>
                    </div>
                  </div>
                ) : videos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {videos.map((video) => (
                      <motion.div
                        key={video.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative aspect-square overflow-hidden bg-[#1C2530]"
                        style={{
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
                        }}
                      >
                        {/* Gradient depth */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#2E4052]/60 via-[#1C2530] to-[#0F161C]" />

                        {/* Play button — breathing ring on hover */}
                        <button
                          type="button"
                          onClick={() => setPreviewVideoId(video.id)}
                          aria-label="預覽影片"
                          className="absolute inset-0 flex items-center justify-center z-10"
                        >
                          <span className="relative flex items-center justify-center">
                            {/* Outer ring — appears on hover */}
                            <span className="absolute w-14 h-14 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-110 transition-all duration-500" />
                            {/* Inner circle */}
                            <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/25 backdrop-blur-sm group-hover:bg-white/20 group-hover:border-white/50 transition-all duration-300">
                              <Play className="h-4 w-4 text-white fill-white translate-x-px" />
                            </span>
                          </span>
                        </button>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 z-[5]" />

                        {/* Bottom info bar — slides up on hover */}
                        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 p-3 bg-gradient-to-t from-black/90 to-transparent z-20">
                          <p className="truncate text-[0.65rem] text-white font-medium">{video.fileName}</p>
                          <p className="text-[0.58rem] text-white/50 mt-0.5">{formatBytes(video.fileSizeBytes)}</p>
                        </div>

                        {/* Delete button — top-right, same as photos */}
                        <button
                          type="button"
                          onClick={() => void handleDelete(video)}
                          disabled={deletingAssetId === video.id}
                          className="absolute right-2 top-2 z-30 flex h-7 w-7 items-center justify-center bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100 hover:bg-red-600/80"
                        >
                          {deletingAssetId === video.id
                            ? <LoaderCircle className="h-3 w-3 animate-spin" />
                            : <Trash2 className="h-3 w-3" />}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : null}
            </div>
          )}

        </div>
      </motion.div>

      {/* ── Video preview modal (phone-frame) ── */}
      <AnimatePresence>
        {previewVideoId && (() => {
          const video = videos.find((v) => v.id === previewVideoId)
          if (!video) return null
          return (
            <motion.div
              key="video-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
              onClick={() => setPreviewVideoId(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 24 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-[390px]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Phone frame chrome */}
                <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black"
                  style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.7)' }}
                >
                  {/* Notch bar */}
                  <div className="flex items-center justify-center h-8 bg-[#0A0A0A]">
                    <div className="w-20 h-1.5 rounded-full bg-white/10" />
                  </div>

                  {/* Video */}
                  <video
                    src={video.url}
                    controls
                    autoPlay
                    className="w-full block bg-black"
                  />

                  {/* Bottom bar */}
                  <div className="h-6 bg-[#0A0A0A] flex items-center justify-center">
                    <div className="w-28 h-1 rounded-full bg-white/15" />
                  </div>
                </div>

                {/* File label */}
                <p className="mt-4 text-center text-[0.65rem] text-white/40 tracking-wide truncate px-4">{video.fileName}</p>

                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setPreviewVideoId(null)}
                  className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

    </div>
  )
}
