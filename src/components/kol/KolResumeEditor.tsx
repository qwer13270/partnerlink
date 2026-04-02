'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Play,
  CheckCircle2,
  UploadCloud,
  ImagePlus,
  Film,
  Trash2,
  Check,
  Monitor,
  Smartphone,
  Eye,
  Palette,
  Camera,
  LoaderCircle,
} from 'lucide-react'
import Link from 'next/link'
import type { KolResumeData, ResumeMediaItem } from '@/data/mock-resume'
import KolResumePage from './KolResumePage'
import { KOL_THEMES, DEFAULT_KOL_THEME, type KolThemeKey } from '@/lib/kol-themes'

// ── Types ───────────────────────────────────────────────────────────────────

type MediaAsset = {
  id: string
  mediaType: 'image' | 'video'
  url: string
  fileName: string
  sortOrder: number
  caption: string
  fileSizeBytes: number
}

type UploadItem = {
  key: string
  fileName: string
  mediaType: 'image' | 'video'
  progress: number
  status: 'uploading' | 'error'
  error?: string
}

// ── Props ──────────────────────────────────────────────────────────────────

type Props = {
  resume: KolResumeData
  onClose: () => void
  onSave: (updated: KolResumeData) => void
}

type Section = 'basics' | 'media' | 'theme'

// ── Field primitives ───────────────────────────────────────────────────────

const fieldWrap =
  'rounded-md border border-foreground/15 bg-background transition-colors duration-150 focus-within:border-foreground/40'
const inputBase =
  'w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/40'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-[0.4em] text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground/60">{hint}</p>}
    </div>
  )
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={fieldWrap}>
      <input className={`${inputBase} ${className}`} {...props} />
    </div>
  )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={fieldWrap}>
      <textarea className={`${inputBase} resize-y`} {...props} />
    </div>
  )
}

// ── Upload helper ──────────────────────────────────────────────────────────

function uploadResumeMedia({
  file,
  mediaType,
  sortOrder,
  onProgress,
}: {
  file: File
  mediaType: 'image' | 'video'
  sortOrder: number
  onProgress: (p: number) => void
}): Promise<MediaAsset> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mediaType', mediaType)
    formData.append('sortOrder', String(sortOrder))

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/kol/resume/media')

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText) as { ok: boolean; asset: MediaAsset }
          resolve(json.asset)
        } catch {
          reject(new Error('Invalid server response'))
        }
      } else {
        try {
          const json = JSON.parse(xhr.responseText) as { error?: string }
          reject(new Error(json.error ?? `Upload failed (${xhr.status})`))
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`))
        }
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error')))
    xhr.send(formData)
  })
}

function toResumeMediaItem(asset: MediaAsset): ResumeMediaItem {
  return {
    id: asset.id,
    mediaType: asset.mediaType,
    url: asset.url,
    caption: asset.caption,
    sortOrder: asset.sortOrder,
  }
}

// ── MediaManager ───────────────────────────────────────────────────────────

function MediaManager({ setParentMedia }: { setParentMedia: React.Dispatch<React.SetStateAction<ResumeMediaItem[]>> }) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const imageRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  // Fetch on mount
  useEffect(() => {
    let cancelled = false
    fetch('/api/kol/resume/media')
      .then((r) => r.json())
      .then((data: { ok?: boolean; assets?: MediaAsset[] }) => {
        if (!cancelled && data.ok && Array.isArray(data.assets)) {
          setAssets(data.assets)
        }
      })
      .catch(() => { /* silently fail */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Sync parent whenever assets change
  useEffect(() => {
    setParentMedia(assets.map(toResumeMediaItem))
  }, [assets, setParentMedia])

  const handleFiles = (mediaType: 'image' | 'video', files: FileList | File[]) => {
    const MAX_BYTES = { image: 10 * 1024 * 1024, video: 100 * 1024 * 1024 }
    const fileArray = Array.from(files)
    fileArray.forEach((file) => {
      const key = `${Date.now()}-${Math.random()}`

      if (file.size > MAX_BYTES[mediaType]) {
        const label = mediaType === 'image' ? '照片超過 10MB 上限' : '影片超過 100MB 上限'
        setUploadItems((prev) => [...prev, { key, fileName: file.name, mediaType, progress: 0, status: 'error', error: label }])
        return
      }

      const item: UploadItem = { key, fileName: file.name, mediaType, progress: 0, status: 'uploading' }

      setUploadItems((prev) => [...prev, item])

      const sortOrder = assets.length + uploadItems.length

      uploadResumeMedia({
        file,
        mediaType,
        sortOrder,
        onProgress: (p) => {
          setUploadItems((prev) => prev.map((u) => u.key === key ? { ...u, progress: p } : u))
        },
      })
        .then((asset) => {
          setAssets((prev) => [...prev, asset])
          setUploadItems((prev) => prev.filter((u) => u.key !== key))
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Upload failed'
          setUploadItems((prev) =>
            prev.map((u) => u.key === key ? { ...u, status: 'error', error: message } : u),
          )
        })
    })
  }

  const handleCaptionChange = (id: string, caption: string) => {
    setAssets((prev) => prev.map((a) => a.id === id ? { ...a, caption } : a))
  }

  const handleCaptionBlur = async (id: string, caption: string) => {
    try {
      await fetch('/api/kol/resume/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: id, caption }),
      })
      setSavedIds((prev) => new Set(prev).add(id))
      setTimeout(() => {
        setSavedIds((prev) => {
          const n = new Set(prev)
          n.delete(id)
          return n
        })
      }, 1500)
    } catch {
      // silently fail
    }
  }

  const handleDelete = (id: string) => {
    // Optimistic removal
    setAssets((prev) => prev.filter((a) => a.id !== id))
    fetch('/api/kol/resume/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId: id }),
    }).catch(() => { /* silently fail */ })
  }

  // Drag-and-drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current += 1
    if (dragCounter.current === 1) setIsDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current === 0) setIsDragging(false)
  }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault() }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (!files.length) return
    const images: File[] = []
    const videos: File[] = []
    Array.from(files).forEach((f) => {
      if (f.type.startsWith('video/')) videos.push(f)
      else images.push(f)
    })
    if (images.length) handleFiles('image', images)
    if (videos.length) handleFiles('video', videos)
  }

  const PHOTO_LIMIT = 9
  const VIDEO_LIMIT = 3

  const photos = assets.filter((a) => a.mediaType === 'image')
  const videos = assets.filter((a) => a.mediaType === 'video')
  const photoUploads = uploadItems.filter((u) => u.mediaType === 'image')
  const videoUploads = uploadItems.filter((u) => u.mediaType === 'video')

  const photoAtLimit = photos.length >= PHOTO_LIMIT
  const videoAtLimit = videos.length >= VIDEO_LIMIT

  const UploadProgress = ({ items }: { items: UploadItem[] }) => (
    <AnimatePresence>
      {items.map((item) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className={`rounded border px-3 py-2 ${
            item.status === 'error' ? 'border-red-200 bg-red-50/40' : 'border-foreground/10 bg-foreground/[0.015]'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="truncate text-xs text-foreground/60">{item.fileName}</span>
            {item.status === 'error' ? (
              <button type="button" onClick={() => setUploadItems((prev) => prev.filter((u) => u.key !== item.key))} className="shrink-0 text-red-400 hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            ) : (
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground/50">{item.progress}%</span>
            )}
          </div>
          {item.status === 'uploading' && (
            <div className="h-0.5 w-full overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full bg-foreground/40 transition-all duration-200" style={{ width: `${item.progress}%` }} />
            </div>
          )}
          {item.status === 'error' && <p className="text-xs text-red-500">{item.error}</p>}
        </motion.div>
      ))}
    </AnimatePresence>
  )

  const AssetRow = ({ asset }: { asset: MediaAsset }) => (
    <div className="group flex items-center gap-3 rounded border border-foreground/8 bg-foreground/[0.015] px-3 py-2.5 transition-colors hover:border-foreground/15">
      <div className="h-[2.75rem] w-[3.5rem] shrink-0 overflow-hidden rounded-sm border border-foreground/10 bg-muted/20">
        {asset.mediaType === 'video' ? (
          <div className="flex h-full w-full items-center justify-center" style={{ background: 'linear-gradient(135deg, #1C2530 0%, #2E4052 100%)' }}>
            <Play className="h-3 w-3 fill-white/60 text-white/60" />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground mb-1">{asset.fileName}</p>
        <textarea
          rows={2}
          value={asset.caption}
          onChange={(e) => handleCaptionChange(asset.id, e.target.value)}
          onBlur={(e) => handleCaptionBlur(asset.id, e.target.value)}
          placeholder="新增說明文字…"
          className={`${inputBase} resize-y rounded border border-foreground/10 py-1 text-[0.65rem] focus:border-foreground/30`}
        />
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <AnimatePresence>
          {savedIds.has(asset.id) && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            </motion.div>
          )}
        </AnimatePresence>
        <button type="button" onClick={() => handleDelete(asset.id)} className="text-muted-foreground/30 opacity-0 transition-all duration-150 hover:text-red-500 group-hover:opacity-100" aria-label="刪除">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )

  return (
    <div
      className="flex flex-col gap-4 px-5 py-5"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Hidden file inputs */}
      <input ref={imageRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { if (e.target.files?.length) { handleFiles('image', e.target.files); e.target.value = '' } }} />
      <input ref={videoRef} type="file" accept="video/*" multiple className="hidden"
        onChange={(e) => { if (e.target.files?.length) { handleFiles('video', e.target.files); e.target.value = '' } }} />

      {/* Drag overlay hint */}
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-foreground/40 bg-background/80">
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">放開以上傳</p>
        </div>
      )}

      {/* ── Photos ─────────────────────────────────── */}
      <div className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/[0.07]">
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">照片</p>
            {!loading && (
              <span className={`text-xs tabular-nums ${photoAtLimit ? 'text-amber-500' : 'text-muted-foreground/40'}`}>
                {photos.length}/{PHOTO_LIMIT}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => imageRef.current?.click()}
            disabled={photoAtLimit}
            className="inline-flex items-center gap-1.5 rounded border border-foreground/[0.12] px-2.5 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ImagePlus className="h-3 w-3" />
            新增
          </button>
        </div>
        <div className="px-4 pt-2 pb-1">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-xs text-muted-foreground">每張照片最大 10MB</p>
          <span className="inline-flex items-center gap-1 rounded bg-foreground/[0.04] px-2 py-0.5 text-xs text-muted-foreground/70">
            <svg className="h-2.5 w-2.5 shrink-0" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            公開頁面以 4:3 橫式裁切顯示
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map((i) => (
              <div key={i} className="animate-pulse rounded border border-foreground/8 bg-foreground/[0.015]">
                <div className="aspect-[4/3] bg-foreground/[0.05]" />
                <div className="p-2 space-y-1.5">
                  <div className="h-2 w-3/4 rounded bg-foreground/[0.05]" />
                  <div className="h-6 rounded bg-foreground/[0.05]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <UploadProgress items={photoUploads} />
            {photos.length === 0 && photoUploads.length === 0 ? (
              <button
                type="button"
                onClick={() => imageRef.current?.click()}
                disabled={photoAtLimit}
                className="w-full flex flex-col items-center gap-2 py-6 rounded border border-dashed border-foreground/[0.12] text-muted-foreground/30 hover:border-foreground/25 hover:text-muted-foreground/50 transition-colors disabled:pointer-events-none disabled:opacity-30"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-xs uppercase tracking-[0.3em]">上傳照片</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {photos.map((asset) => (
                  <div key={asset.id} className="group rounded border border-foreground/8 overflow-hidden bg-foreground/[0.015] hover:border-foreground/15 transition-colors">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset.url} alt="" className="h-full w-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                      <button
                        type="button"
                        onClick={() => handleDelete(asset.id)}
                        className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-red-500/80 hover:text-white transition-all duration-150"
                        aria-label="刪除"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                      {savedIds.has(asset.id) && (
                        <div className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/90">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <textarea
                        rows={2}
                        value={asset.caption}
                        onChange={(e) => handleCaptionChange(asset.id, e.target.value)}
                        onBlur={(e) => handleCaptionBlur(asset.id, e.target.value)}
                        placeholder="說明文字…"
                        className={`${inputBase} resize-none rounded border border-foreground/10 py-1 text-xs focus:border-foreground/30 w-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        </div>{/* inner px-4 */}
      </div>{/* card */}

      {/* ── Videos ─────────────────────────────────── */}
      <div className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/[0.07]">
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">影片</p>
            {!loading && (
              <span className={`text-xs tabular-nums ${videoAtLimit ? 'text-amber-500' : 'text-muted-foreground/40'}`}>
                {videos.length}/{VIDEO_LIMIT}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => videoRef.current?.click()}
            disabled={videoAtLimit}
            className="inline-flex items-center gap-1.5 rounded border border-foreground/[0.12] px-2.5 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <Film className="h-3 w-3" />
            新增
          </button>
        </div>
        <div className="px-4 pt-2 pb-4">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-xs text-muted-foreground">每支影片最大 100MB</p>
          <span className="inline-flex items-center gap-1 rounded bg-foreground/[0.04] px-2 py-0.5 text-xs text-muted-foreground/70">
            <svg className="h-2.5 w-2.5 shrink-0" viewBox="0 0 10 8" fill="none" aria-hidden="true">
              <rect x="0.6" y="0.6" width="6.8" height="6.8" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7.4 3.2 L9.4 2 L9.4 6 L7.4 4.8Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
            </svg>
            公開頁面以原始比例播放，建議 16:9
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded border border-foreground/8 bg-foreground/[0.015] px-3 py-2.5 animate-pulse">
                <div className="h-[2.75rem] w-[3.5rem] shrink-0 rounded-sm bg-foreground/[0.06]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 w-3/5 rounded bg-foreground/[0.06]" />
                  <div className="h-2 w-4/5 rounded bg-foreground/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <UploadProgress items={videoUploads} />
            {videos.length === 0 && videoUploads.length === 0 ? (
              <button
                type="button"
                onClick={() => videoRef.current?.click()}
                disabled={videoAtLimit}
                className="w-full flex flex-col items-center gap-2 py-6 rounded border border-dashed border-foreground/[0.12] text-muted-foreground/30 hover:border-foreground/25 hover:text-muted-foreground/50 transition-colors disabled:pointer-events-none disabled:opacity-30"
              >
                <Film className="h-5 w-5" />
                <span className="text-xs uppercase tracking-[0.3em]">上傳影片</span>
              </button>
            ) : (
              <div className="space-y-2">
                {videos.map((asset) => <AssetRow key={asset.id} asset={asset} />)}
              </div>
            )}
          </>
        )}
        </div>{/* inner px-4 */}
      </div>{/* card */}
    </div>
  )
}

// ── Main editor ────────────────────────────────────────────────────────────

export default function KolResumeEditor({ resume, onClose, onSave }: Props) {
  const router = useRouter()
  const [displayName,   setDisplayName]   = useState(resume.displayName)
  const [bio,           setBio]           = useState(resume.bio)
  const [followerCount, setFollowerCount] = useState(String(resume.followerCount))
  const [nicheTags,     setNicheTags]     = useState<string[]>(resume.nicheTags)
  const [tagInput,      setTagInput]      = useState('')
  const [mediaItems,    setMediaItems]    = useState<ResumeMediaItem[]>(() => resume.media)
  const [colorTheme,    setColorTheme]    = useState<KolThemeKey>((resume.colorTheme as KolThemeKey) ?? DEFAULT_KOL_THEME)
  const [activeSection, setActiveSection] = useState<Section>('basics')
  const [saved,         setSaved]         = useState(false)
  const [viewMode,      setViewMode]      = useState<'desktop' | 'mobile'>('desktop')
  const [iframeReady,   setIframeReady]   = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // ── Profile photo state ──────────────────────────────────────────────────
  const [photoUrl,     setPhotoUrl]     = useState<string | null>(resume.profilePhotoUrl ?? null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile,    setPhotoFile]    = useState<File | null>(null)
  const [photoSaving,  setPhotoSaving]  = useState(false)
  const [photoSuccess, setPhotoSuccess] = useState(false)
  const [photoError,   setPhotoError]   = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (file: File) => {
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setPhotoError('')
    setPhotoSuccess(false)
  }

  const handlePhotoSave = async () => {
    if (!photoFile) return
    setPhotoSaving(true)
    setPhotoError('')
    try {
      const profileRes  = await fetch('/api/kol/profile')
      const profileData = (await profileRes.json().catch(() => null)) as { profile?: { bio?: string } } | null
      const currentBio  = profileData?.profile?.bio ?? bio

      const formData = new FormData()
      formData.append('bio', currentBio)
      formData.append('profilePhoto', photoFile)

      const res     = await fetch('/api/kol/profile', { method: 'PUT', body: formData })
      const payload = (await res.json().catch(() => null)) as { profile?: { profilePhotoUrl?: string | null }; error?: string } | null

      if (!res.ok) { setPhotoError(payload?.error ?? '儲存失敗，請稍後再試。'); return }

      const newUrl = payload?.profile?.profilePhotoUrl ?? null
      setPhotoUrl(newUrl)
      setPhotoPreview(null)
      setPhotoFile(null)
      setPhotoSuccess(true)
      window.dispatchEvent(new CustomEvent('profile-photo-updated', { detail: { url: newUrl } }))
      router.refresh()
      setTimeout(() => setPhotoSuccess(false), 2000)
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : '儲存失敗，請稍後再試。')
    } finally {
      setPhotoSaving(false)
    }
  }

  // Reset ready state when view mode switches (new iframe mounts)
  useEffect(() => { setIframeReady(false) }, [viewMode])

  // Listen for ready signal from frame
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'ready') setIframeReady(true)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Push live resume to iframe whenever it changes
  const pushToFrame = useCallback((data: KolResumeData) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'update', resume: data }, '*')
  }, [])

  useEffect(() => {
    if (!iframeReady) return
    pushToFrame(liveResume)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeReady, displayName, bio, followerCount, nicheTags, mediaItems, colorTheme, photoUrl, photoPreview])

  // Build the live resume for the right-side preview
  const liveResume: KolResumeData = {
    ...resume,
    displayName,
    bio,
    followerCount: Math.max(0, parseInt(followerCount, 10) || 0),
    nicheTags,
    media: mediaItems,
    colorTheme,
    profilePhotoUrl: photoPreview ?? photoUrl,
  }

  const isDirty =
    displayName !== resume.displayName ||
    bio !== resume.bio ||
    followerCount !== String(resume.followerCount) ||
    JSON.stringify(nicheTags) !== JSON.stringify(resume.nicheTags) ||
    colorTheme !== (resume.colorTheme ?? DEFAULT_KOL_THEME)

  const handleSave = async () => {
    try {
      await fetch('/api/kol/resume/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: liveResume.displayName,
          bio: liveResume.bio,
          followerCount: liveResume.followerCount,
          nicheTags: liveResume.nicheTags,
          colorTheme: liveResume.colorTheme,
        }),
      })
    } catch {
      // silently fail — optimistic update still proceeds
    }
    onSave(liveResume)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !nicheTags.includes(t)) setNicheTags((prev) => [...prev, t])
    setTagInput('')
  }

  const SECTIONS: { id: Section; label: string }[] = [
    { id: 'basics', label: '基本資料' },
    { id: 'media',  label: '媒體管理' },
    { id: 'theme',  label: '外觀主題' },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#f0ece4]">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-foreground/10 bg-background/98 backdrop-blur-md">
        <div className="flex items-center gap-4 px-5 py-4 lg:px-6">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-foreground/5 hover:text-foreground"
            aria-label="關閉編輯器"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="h-6 w-px shrink-0 bg-foreground/10" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm leading-snug">{resume.displayName}</p>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">履歷編輯器</p>
          </div>

          {isDirty && !saved && (
            <span className="hidden rounded bg-amber-50 px-2.5 py-1 text-xs uppercase tracking-widest text-amber-700 ring-1 ring-amber-200 sm:inline-block">
              未儲存
            </span>
          )}
          {saved && (
            <span className="hidden rounded bg-emerald-50 px-2.5 py-1 text-xs uppercase tracking-widest text-emerald-700 ring-1 ring-emerald-200 sm:inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              已儲存
            </span>
          )}

          {/* View mode toggle */}
          <div className="hidden lg:flex shrink-0 items-center gap-0.5 rounded-lg border border-foreground/10 bg-foreground/[0.03] p-1">
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

          {/* Preview link */}
          <Link
            href={`/kols/${resume.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-9 items-center gap-2 rounded-lg border border-foreground/15 px-3.5 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-150 hover:border-foreground/30 hover:text-foreground sm:inline-flex"
          >
            <Eye className="h-3.5 w-3.5" />
            預覽
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-5 text-xs uppercase tracking-[0.3em] text-background transition-opacity duration-150 hover:bg-foreground/85 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Save className="h-3.5 w-3.5" />
            儲存
          </button>
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────── */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[360px_1fr] overflow-hidden">

        {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
        <aside className="flex min-h-0 flex-col overflow-hidden border-r border-foreground/10 bg-background">

          {/* Section tabs */}
          <div className="shrink-0 border-b border-foreground/[0.07] px-5 pt-4">
            <div className="flex items-center">
              {SECTIONS.map(({ id, label }) => {
                const active = activeSection === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                    className={`relative mr-5 pb-3.5 text-xs uppercase tracking-[0.3em] transition-colors duration-150 ${
                      active ? 'text-foreground' : 'text-muted-foreground/40 hover:text-muted-foreground/70'
                    }`}
                  >
                    {label}
                    {active && (
                      <motion.div
                        layoutId="editor-tab-line"
                        className="absolute bottom-0 left-0 right-0 h-px bg-foreground"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section content */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {/* Always mounted so media is preloaded regardless of active tab */}
            <div className={activeSection !== 'media' ? 'hidden' : ''}>
              <MediaManager setParentMedia={setMediaItems} />
            </div>

            <AnimatePresence mode="wait" initial={false}>

              {/* ── Basics ── */}
              {activeSection === 'basics' && (
                <motion.div
                  key="basics"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                  className="space-y-5 px-5 py-5"
                >
                  {/* ── Profile photo ── */}
                  <div>
                    <p className="mb-3 text-xs uppercase tracking-[0.4em] text-muted-foreground">個人頭像</p>
                    <div className="flex items-center gap-4">
                      {/* Avatar preview */}
                      <div className="relative shrink-0">
                        <div className="h-16 w-16 rounded-full overflow-hidden border border-foreground/15 bg-muted/30 flex items-center justify-center">
                          {(photoPreview ?? photoUrl) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photoPreview ?? photoUrl ?? ''}
                              alt={displayName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-serif text-muted-foreground select-none">
                              {(displayName || 'K').slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {photoSuccess && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-emerald-500">
                            <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <label className="group flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-foreground/20 px-3 py-2.5 transition-all hover:border-foreground/40 hover:bg-foreground/[0.02]">
                          <Camera className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                            {photoPreview ? '重新選擇' : (photoUrl ? '更換頭像' : '上傳頭像')}
                          </span>
                          <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) handlePhotoChange(f)
                              e.target.value = ''
                            }}
                          />
                        </label>

                        {photoPreview && (
                          <button
                            type="button"
                            onClick={handlePhotoSave}
                            disabled={photoSaving || photoSuccess}
                            className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-3 py-2 text-xs uppercase tracking-[0.2em] text-background transition-opacity hover:bg-foreground/85 disabled:opacity-40"
                          >
                            {photoSaving ? (
                              <><LoaderCircle className="h-3 w-3 animate-spin" />上傳中…</>
                            ) : photoSuccess ? (
                              <><CheckCircle2 className="h-3 w-3" />已更新</>
                            ) : (
                              '確認上傳'
                            )}
                          </button>
                        )}

                        {photoError && (
                          <p className="text-xs text-red-600">{photoError}</p>
                        )}

                        <p className="text-[0.6rem] text-muted-foreground/50">JPG、PNG，最大 10 MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-foreground/[0.07]" />

                  <Field label="顯示名稱">
                    <Input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="你的公開姓名"
                    />
                  </Field>

                  <Field label="自我介紹" hint={`${bio.length} / 400 字`}>
                    <Textarea
                      rows={6}
                      value={bio}
                      maxLength={400}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="描述你的受眾、內容方向與風格，讓商家快速了解你的定位。"
                    />
                  </Field>

                  <Field label="追蹤者人數">
                    <Input
                      type="number"
                      min={0}
                      value={followerCount}
                      onChange={(e) => setFollowerCount(e.target.value)}
                    />
                  </Field>

                  <Field label="專長標籤">
                    <div className="flex flex-wrap gap-1.5 mb-2 min-h-[2rem]">
                      {nicheTags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-sm border border-foreground/15 bg-foreground/[0.03] px-2.5 py-1 text-xs uppercase tracking-[0.2em]">
                          {tag}
                          <button
                            type="button"
                            onClick={() => setNicheTags((prev) => prev.filter((t) => t !== tag))}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`${fieldWrap} flex-1`}>
                        <input
                          className={inputBase}
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
                          placeholder="新增標籤，按 Enter 確認"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addTag}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-foreground/15 text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </Field>
                </motion.div>
              )}

              {/* ── Theme ── */}
              {activeSection === 'theme' && (
                <motion.div
                  key="theme"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                  className="px-5 py-5 space-y-6"
                >
                  <div>
                    <label className="mb-3 block text-xs uppercase tracking-[0.4em] text-muted-foreground">
                      色彩主題
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.entries(KOL_THEMES) as [KolThemeKey, typeof KOL_THEMES[KolThemeKey]][]).map(([key, theme]) => {
                        const active = colorTheme === key
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setColorTheme(key)}
                            className={`group flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all duration-150 ${
                              active
                                ? 'border-foreground/40 bg-foreground/[0.04]'
                                : 'border-foreground/[0.08] hover:border-foreground/20 hover:bg-foreground/[0.02]'
                            }`}
                          >
                            {/* Swatch: bg fill + accent diagonal stripe */}
                            <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md border border-foreground/10">
                              <div className="absolute inset-0" style={{ background: theme['--k-hero'] }} />
                              {/* Diagonal accent stripe bottom-right */}
                              <div
                                className="absolute"
                                style={{
                                  bottom: -4, right: -4,
                                  width: 28, height: 28,
                                  background: theme['--k-accent'],
                                  transform: 'rotate(45deg)',
                                  opacity: 0.9,
                                }}
                              />
                              {/* Accent dot center */}
                              <div
                                className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full"
                                style={{ background: theme['--k-accent'] }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm leading-snug">{theme.label}</p>
                              <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground/50">
                                {theme['--k-accent']}
                              </p>
                            </div>
                            {active && (
                              <Check className="h-3.5 w-3.5 shrink-0 text-foreground/70" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground/50 leading-relaxed">
                    選擇主題後，右側預覽會立即更新。儲存後套用至公開頁面。
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </aside>

        {/* ── RIGHT: LIVE PREVIEW ───────────────────────────── */}
        <div
          className="hidden lg:flex min-h-0 flex-1 items-start justify-center overflow-auto bg-[#d9d1c5] p-6 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {viewMode === 'desktop' ? (
            <div className="w-full max-w-[1280px] overflow-hidden rounded-[28px] border border-black/10 shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
              <iframe
                ref={iframeRef}
                src={`/kols/${resume.username}/frame`}
                className="block w-full bg-background"
                style={{ height: '100vh', minHeight: 600 }}
                title="桌機預覽"
                onLoad={() => pushToFrame(liveResume)}
              />
            </div>
          ) : (
            <div className="w-full max-w-[390px] overflow-hidden rounded-[44px] border-[6px] border-black/80 shadow-[0_30px_90px_rgba(0,0,0,0.30)]">
              {/* Notch bar */}
              <div className="flex h-8 items-center justify-center bg-[#0A0A0A]">
                <div className="h-1.5 w-24 rounded-full bg-white/10" />
              </div>
              <iframe
                ref={iframeRef}
                src={`/kols/${resume.username}/frame`}
                className="block w-full bg-background"
                style={{ height: 812 }}
                title="手機預覽"
                onLoad={() => pushToFrame(liveResume)}
              />
              {/* Home indicator */}
              <div className="flex h-6 items-center justify-center bg-[#0A0A0A]">
                <div className="h-1 w-28 rounded-full bg-white/10" />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
