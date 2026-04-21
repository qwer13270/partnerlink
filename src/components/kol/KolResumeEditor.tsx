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
  'rounded-lg border border-white/10 bg-white/[0.03] transition-colors duration-150 focus-within:border-white/35 focus-within:bg-white/[0.05]'
const inputBase =
  'w-full bg-transparent px-3.5 py-3 text-base text-white/90 outline-none placeholder:text-white/25 font-body'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[12px] uppercase tracking-[0.35em] text-white/65 font-body">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[13px] text-white/45 font-body">{hint}</p>}
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

// ── Asset row ──────────────────────────────────────────────────────────────

type AssetRowProps = {
  asset: MediaAsset
  isSaved: boolean
  onCaptionChange: (id: string, caption: string) => void
  onCaptionBlur: (id: string, caption: string) => void
  onDelete: (id: string) => void
}

function AssetRow({ asset, isSaved, onCaptionChange, onCaptionBlur, onDelete }: AssetRowProps) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-white/25 hover:bg-white/[0.04]">
      <div className="h-[2.75rem] w-[3.5rem] shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/[0.04]">
        {asset.mediaType === 'video' ? (
          <div className="flex h-full w-full items-center justify-center" style={{ background: 'linear-gradient(135deg, #0b1a2c 0%, #1a3052 100%)' }}>
            <Play className="h-3 w-3 fill-white/80 text-white/80" />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-white/60 font-body mb-1.5">{asset.fileName}</p>
        <textarea
          rows={2}
          value={asset.caption}
          onChange={(e) => onCaptionChange(asset.id, e.target.value)}
          onBlur={(e) => onCaptionBlur(asset.id, e.target.value)}
          placeholder="新增說明文字…"
          className={`${inputBase} resize-y rounded-md border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[13px] focus:border-white/25`}
        />
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <AnimatePresence>
          {isSaved && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}>
              <Check className="h-3.5 w-3.5 text-emerald-300" />
            </motion.div>
          )}
        </AnimatePresence>
        <button type="button" onClick={() => onDelete(asset.id)} className="text-white/30 opacity-0 transition-all duration-150 hover:text-red-400 group-hover:opacity-100" aria-label="刪除">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Upload progress ────────────────────────────────────────────────────────

function UploadProgress({ items, onDismiss }: { items: UploadItem[]; onDismiss: (key: string) => void }) {
  return (
    <AnimatePresence>
      {items.map((item) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className={`rounded-lg border px-3 py-2 ${
            item.status === 'error' ? 'border-red-400/30 bg-red-500/10' : 'border-white/10 bg-white/[0.03]'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="truncate text-sm text-white/70 font-body">{item.fileName}</span>
            {item.status === 'error' ? (
              <button type="button" onClick={() => onDismiss(item.key)} className="shrink-0 text-red-300 hover:text-red-200">
                <X className="h-3 w-3" />
              </button>
            ) : (
              <span className="shrink-0 text-sm tabular-nums text-white/55 font-mono">{item.progress}%</span>
            )}
          </div>
          {item.status === 'uploading' && (
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-gradient-to-r from-[#7aa8ff] to-[#dbeafe] transition-all duration-200" style={{ width: `${item.progress}%`, boxShadow: '0 0 12px rgba(140,200,255,0.55)' }} />
            </div>
          )}
          {item.status === 'error' && <p className="text-sm text-red-300">{item.error}</p>}
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

// ── Upload helper ──────────────────────────────────────────────────────────

async function uploadResumeMedia({
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
  // Step 1: Ask the API for a signed Supabase upload URL (no file sent to Vercel)
  const prepareRes = await fetch('/api/kol/resume/media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mediaType, sortOrder, fileName: file.name, mimeType: file.type, fileSize: file.size }),
  })
  if (!prepareRes.ok) {
    const json = await prepareRes.json().catch(() => ({})) as { error?: string }
    throw new Error(json.error ?? `Upload failed (${prepareRes.status})`)
  }
  const { signedUrl, path } = await prepareRes.json() as { signedUrl: string; path: string }

  // Step 2: Upload the file directly to Supabase Storage (bypasses Vercel body limit)
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', signedUrl)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    })

    xhr.addEventListener('load', () => {
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Storage upload failed (${xhr.status})`))
    })
    xhr.addEventListener('error', () => reject(new Error('Network error')))
    xhr.send(file)
  })

  // Step 3: Tell the API to register the asset in the database
  const confirmRes = await fetch('/api/kol/resume/media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'confirm', path, mediaType, sortOrder, mimeType: file.type, fileSize: file.size }),
  })
  if (!confirmRes.ok) {
    const json = await confirmRes.json().catch(() => ({})) as { error?: string }
    throw new Error(json.error ?? `Upload failed (${confirmRes.status})`)
  }
  const { asset } = await confirmRes.json() as { asset: MediaAsset }
  return asset
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
    const MAX_BYTES = { image: 10 * 1024 * 1024, video: 50 * 1024 * 1024 }
    const fileArray = Array.from(files)
    fileArray.forEach((file) => {
      const key = `${Date.now()}-${Math.random()}`

      if (file.size > MAX_BYTES[mediaType]) {
        const label = mediaType === 'image' ? '照片超過 10MB 上限' : '影片超過 50MB 上限'
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

  const handleDismissUpload = useCallback((key: string) => {
    setUploadItems((prev) => prev.filter((u) => u.key !== key))
  }, [])

  return (
    <div
      className="flex flex-col gap-4 px-5 py-6"
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
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-white/40 bg-black/70 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-white/85 font-body">放開以上傳</p>
        </div>
      )}

      {/* ── Photos ─────────────────────────────────── */}
      <div className="liquid-glass !rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <p className="text-[12px] uppercase tracking-[0.35em] text-white/65 font-body">照片</p>
            {!loading && (
              <span className={`text-[13px] tabular-nums font-mono ${photoAtLimit ? 'text-amber-300' : 'text-white/40'}`}>
                {photos.length}/{PHOTO_LIMIT}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => imageRef.current?.click()}
            disabled={photoAtLimit}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[12px] uppercase tracking-[0.2em] text-white/80 transition-colors hover:border-white/30 hover:bg-white/[0.08] hover:text-white disabled:pointer-events-none disabled:opacity-30 font-body"
          >
            <ImagePlus className="h-3 w-3" />
            新增
          </button>
        </div>
        <div className="px-4 pt-3 pb-2">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-[13px] text-white/55 font-body">每張照片最大 10MB</p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[12px] text-white/60 font-body">
            <svg className="h-2.5 w-2.5 shrink-0" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            公開頁面以 4:3 橫式裁切顯示
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border border-white/10 bg-white/[0.02]">
                <div className="aspect-[4/3] bg-white/[0.05]" />
                <div className="p-2 space-y-1.5">
                  <div className="h-2 w-3/4 rounded bg-white/[0.06]" />
                  <div className="h-6 rounded bg-white/[0.04]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <UploadProgress items={photoUploads} onDismiss={handleDismissUpload} />
            {photos.length === 0 && photoUploads.length === 0 ? (
              <button
                type="button"
                onClick={() => imageRef.current?.click()}
                disabled={photoAtLimit}
                className="w-full flex flex-col items-center gap-2 py-6 rounded-lg border border-dashed border-white/15 text-white/35 hover:border-white/30 hover:text-white/60 hover:bg-white/[0.02] transition-colors disabled:pointer-events-none disabled:opacity-30 font-body"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[12px] uppercase tracking-[0.28em]">上傳照片</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {photos.map((asset) => (
                  <div key={asset.id} className="group rounded-lg border border-white/10 overflow-hidden bg-white/[0.02] hover:border-white/25 transition-colors">
                    <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.04]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset.url} alt="" className="h-full w-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                      <button
                        type="button"
                        onClick={() => handleDelete(asset.id)}
                        className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white/80 opacity-0 group-hover:opacity-100 hover:bg-red-500/80 hover:text-white transition-all duration-150 backdrop-blur-sm"
                        aria-label="刪除"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                      {savedIds.has(asset.id) && (
                        <div className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/90 shadow-[0_0_10px_rgba(140,230,180,0.5)]">
                          <Check className="h-2.5 w-2.5 text-black" />
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
                        className={`${inputBase} resize-none rounded-md border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[13px] focus:border-white/25 w-full`}
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
      <div className="liquid-glass !rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <p className="text-[12px] uppercase tracking-[0.35em] text-white/65 font-body">影片</p>
            {!loading && (
              <span className={`text-[13px] tabular-nums font-mono ${videoAtLimit ? 'text-amber-300' : 'text-white/40'}`}>
                {videos.length}/{VIDEO_LIMIT}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => videoRef.current?.click()}
            disabled={videoAtLimit}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[12px] uppercase tracking-[0.2em] text-white/80 transition-colors hover:border-white/30 hover:bg-white/[0.08] hover:text-white disabled:pointer-events-none disabled:opacity-30 font-body"
          >
            <Film className="h-3 w-3" />
            新增
          </button>
        </div>
        <div className="px-4 pt-3 pb-4">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-[13px] text-white/55 font-body">每支影片最大 50MB</p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[12px] text-white/60 font-body">
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
              <div key={i} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 animate-pulse">
                <div className="h-[2.75rem] w-[3.5rem] shrink-0 rounded-md bg-white/[0.06]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 w-3/5 rounded bg-white/[0.06]" />
                  <div className="h-2 w-4/5 rounded bg-white/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <UploadProgress items={videoUploads} onDismiss={handleDismissUpload} />
            {videos.length === 0 && videoUploads.length === 0 ? (
              <button
                type="button"
                onClick={() => videoRef.current?.click()}
                disabled={videoAtLimit}
                className="w-full flex flex-col items-center gap-2 py-6 rounded-lg border border-dashed border-white/15 text-white/35 hover:border-white/30 hover:text-white/60 hover:bg-white/[0.02] transition-colors disabled:pointer-events-none disabled:opacity-30 font-body"
              >
                <Film className="h-5 w-5" />
                <span className="text-[12px] uppercase tracking-[0.28em]">上傳影片</span>
              </button>
            ) : (
              <div className="space-y-2">
                {videos.map((asset) => <AssetRow key={asset.id} asset={asset} isSaved={savedIds.has(asset.id)} onCaptionChange={handleCaptionChange} onCaptionBlur={handleCaptionBlur} onDelete={handleDelete} />)}
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
  const [collabFee,     setCollabFee]     = useState(resume.collabFee != null ? String(resume.collabFee) : '')
  const [activeSection, setActiveSection] = useState<Section>('basics')
  const [saved,         setSaved]         = useState(false)
  const [viewMode,      setViewMode]      = useState<'desktop' | 'mobile'>('desktop')
  const [iframeReady,   setIframeReady]   = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // ── Profile photo state ──────────────────────────────────────────────────
  const [photoUrl,     setPhotoUrl]     = useState<string | null>(resume.profilePhotoUrl ?? null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoSaving,  setPhotoSaving]  = useState(false)
  const [photoSuccess, setPhotoSuccess] = useState(false)
  const [photoError,   setPhotoError]   = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = async (file: File) => {
    const preview = URL.createObjectURL(file)
    setPhotoPreview(preview)
    setPhotoError('')
    setPhotoSuccess(false)
    setPhotoSaving(true)
    try {
      const profileRes  = await fetch('/api/kol/profile')
      const profileData = (await profileRes.json().catch(() => null)) as { profile?: { bio?: string } } | null
      const currentBio  = profileData?.profile?.bio ?? bio

      const formData = new FormData()
      formData.append('bio', currentBio)
      formData.append('profilePhoto', file)

      const res     = await fetch('/api/kol/profile', { method: 'PUT', body: formData })
      const payload = (await res.json().catch(() => null)) as { profile?: { profilePhotoUrl?: string | null }; error?: string } | null

      if (!res.ok) { setPhotoError(payload?.error ?? '儲存失敗，請稍後再試。'); return }

      const newUrl = payload?.profile?.profilePhotoUrl ?? null
      setPhotoUrl(newUrl)
      setPhotoPreview(null)
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
  }, [iframeReady, displayName, bio, followerCount, nicheTags, mediaItems, colorTheme, photoUrl, photoPreview, collabFee])

  // Build the live resume for the right-side preview
  const parsedFee = parseInt(collabFee, 10) || 0

  const liveResume: KolResumeData = {
    ...resume,
    displayName,
    bio,
    followerCount: Math.max(0, parseInt(followerCount, 10) || 0),
    nicheTags,
    media: mediaItems,
    colorTheme,
    profilePhotoUrl: photoPreview ?? photoUrl,
    collabFee: parsedFee > 0 ? parsedFee : null,
  }

  const isDirty =
    displayName !== resume.displayName ||
    bio !== resume.bio ||
    followerCount !== String(resume.followerCount) ||
    JSON.stringify(nicheTags) !== JSON.stringify(resume.nicheTags) ||
    colorTheme !== (resume.colorTheme ?? DEFAULT_KOL_THEME) ||
    parsedFee !== (resume.collabFee ?? 0)

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
          collabFee: liveResume.collabFee,
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
    <div className="partnerlink-landing fixed inset-0 z-[100] flex flex-col overflow-hidden bg-black text-white">
      {/* ── Ambient backdrop ─────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 15% 0%, rgba(60,110,220,0.18), transparent 60%), radial-gradient(ellipse 55% 40% at 95% 100%, rgba(30,70,160,0.14), transparent 65%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)',
        }}
      />

      {/* ── Header ────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-white/10 bg-black/75 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-4 px-5 py-3.5 lg:px-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="返回"
            className="group relative inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] pl-2.5 pr-4 text-[12px] uppercase tracking-[0.32em] text-white/75 transition-all duration-200 hover:border-white/30 hover:bg-white/[0.08] hover:text-white font-body"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 transition-all duration-200 group-hover:bg-white group-hover:text-black group-hover:-translate-x-0.5">
              <ArrowLeft className="h-3 w-3" />
            </span>
            返回
          </button>

          <div className="flex-1" />

          {isDirty && !saved && (
            <span className="hidden sm:inline-flex items-center gap-1.5 liquid-glass !rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-amber-200/90 font-body">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-amber-300/70 animate-ping" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-amber-300" />
              </span>
              未儲存
            </span>
          )}
          {saved && (
            <span className="hidden sm:inline-flex items-center gap-1.5 liquid-glass !rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-emerald-200/95 font-body">
              <CheckCircle2 className="h-3 w-3" />
              已儲存
            </span>
          )}

          {/* View mode toggle */}
          <div className="hidden lg:flex shrink-0 items-center gap-0.5 rounded-full liquid-glass !p-1">
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              title="桌機檢視"
              className={`flex h-7 w-9 items-center justify-center rounded-full transition-all duration-200 ${
                viewMode === 'desktop'
                  ? 'bg-white text-black shadow-[0_0_14px_rgba(200,220,255,0.28)]'
                  : 'text-white/55 hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              title="手機檢視"
              className={`flex h-7 w-9 items-center justify-center rounded-full transition-all duration-200 ${
                viewMode === 'mobile'
                  ? 'bg-white text-black shadow-[0_0_14px_rgba(200,220,255,0.28)]'
                  : 'text-white/55 hover:text-white'
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
            className="hidden sm:inline-flex h-9 items-center gap-2 liquid-glass !rounded-full px-4 text-[10px] uppercase tracking-[0.3em] text-white/80 transition-colors duration-150 hover:text-white font-body"
          >
            <Eye className="h-3.5 w-3.5" />
            預覽
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-5 text-[10px] uppercase tracking-[0.3em] text-black font-body font-medium transition-opacity duration-150 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-25"
          >
            <Save className="h-3.5 w-3.5" />
            儲存
          </button>
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────── */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[380px_1fr] overflow-hidden relative z-10">

        {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
        <aside className="flex min-h-0 flex-col overflow-hidden border-r border-white/10 bg-black/40 backdrop-blur-xl">

          {/* Section tabs */}
          <div className="shrink-0 border-b border-white/10 px-5 pt-4">
            <div className="flex items-center">
              {SECTIONS.map(({ id, label }) => {
                const active = activeSection === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                    className={`relative mr-6 pb-3.5 text-[13px] uppercase tracking-[0.3em] font-body transition-colors duration-150 ${
                      active ? 'text-white' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {label}
                    {active && (
                      <motion.div
                        layoutId="editor-tab-line"
                        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
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
                  className="space-y-6 px-5 py-6"
                >
                  {/* ── Profile photo ── */}
                  <div>
                    <p className="mb-3 text-[12px] uppercase tracking-[0.35em] text-white/65 font-body">
                      Avatar <span className="font-heading italic normal-case tracking-normal text-white/85 text-[15px]">個人頭像</span>
                    </p>
                    <div className="flex items-center gap-4">
                      {/* Avatar preview */}
                      <div className="relative shrink-0">
                        <div
                          className="absolute inset-0 -m-1 rounded-full opacity-70 blur-md"
                          style={{ background: 'radial-gradient(circle at 35% 30%, rgba(140,200,255,0.35) 0%, rgba(20,40,80,0) 65%)' }}
                        />
                        <div className="relative h-16 w-16 rounded-full overflow-hidden border border-white/20 bg-white/[0.04] flex items-center justify-center shadow-[0_0_24px_rgba(140,200,255,0.15)]">
                          {(photoPreview ?? photoUrl) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photoPreview ?? photoUrl ?? ''}
                              alt={displayName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-heading italic text-white/70 select-none">
                              {(displayName || 'K').slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {photoSuccess && (
                          <span className="absolute -bottom-0.5 -right-0.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-black bg-emerald-400 shadow-[0_0_10px_rgba(140,230,180,0.6)]">
                            <CheckCircle2 className="h-2.5 w-2.5 text-black" />
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <label className={`group flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 transition-all font-body ${photoSaving ? 'pointer-events-none border-white/15 opacity-60' : 'border-white/20 hover:border-white/40 hover:bg-white/[0.03]'}`}>
                          {photoSaving ? (
                            <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin text-white/60" />
                          ) : (
                            <Camera className="h-3.5 w-3.5 shrink-0 text-white/60 group-hover:text-white transition-colors" />
                          )}
                          <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                            {photoSaving ? '上傳中…' : (photoUrl ? '更換頭像' : '上傳頭像')}
                          </span>
                          <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={photoSaving}
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) handlePhotoChange(f)
                              e.target.value = ''
                            }}
                          />
                        </label>

                        {photoError && (
                          <p className="text-sm text-red-300 font-body">{photoError}</p>
                        )}

                        <p className="text-[12px] text-white/45 font-body">JPG、PNG，最大 10 MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/[0.08]" />

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
                        <span key={tag} className="inline-flex items-center gap-1.5 liquid-glass !rounded-full px-3.5 py-1.5 text-[13px] uppercase tracking-[0.18em] text-white/90 font-body">
                          {tag}
                          <button
                            type="button"
                            onClick={() => setNicheTags((prev) => prev.filter((t) => t !== tag))}
                            className="text-white/45 hover:text-white transition-colors"
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
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full liquid-glass text-white/75 hover:text-white transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </Field>

                  <div className="h-px bg-white/[0.08]" />

                  {/* ── Collaboration fee ── */}
                  <div>
                    <label className="mb-2 block text-[12px] uppercase tracking-[0.35em] text-white/65 font-body">
                      Rate <span className="font-heading italic normal-case tracking-normal text-white/85 text-[15px]">合作費用</span>
                    </label>

                    <div className={`${fieldWrap} flex items-center`}>
                      <span className="pl-3.5 text-[13px] text-white/50 font-mono tracking-[0.08em] select-none shrink-0">NT$</span>
                      <input
                        type="number"
                        min={0}
                        value={collabFee}
                        onChange={(e) => setCollabFee(e.target.value)}
                        placeholder="例：20000"
                        className={`${inputBase} pl-1.5`}
                      />
                    </div>

                    {/* Live formatted preview */}
                    <div className="mt-2.5 h-8 flex items-center">
                      {parsedFee > 0 ? (
                        <motion.p
                          key={parsedFee}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm text-white/75 font-body"
                        >
                          <span className="font-heading italic text-[#dbeafe]">NT$</span>
                          {parsedFee.toLocaleString('zh-TW')}
                          <span className="ml-2 text-white/40">/ 每次合作</span>
                        </motion.p>
                      ) : (
                        <p className="text-sm text-white/40 font-body">未設定費用，商家無法以預算篩選</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Theme ── */}
              {activeSection === 'theme' && (
                <motion.div
                  key="theme"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                  className="px-5 py-6 space-y-6"
                >
                  <div>
                    <label className="mb-3 block text-[12px] uppercase tracking-[0.35em] text-white/65 font-body">
                      Palette <span className="font-heading italic normal-case tracking-normal text-white/85 text-[15px]">色彩主題</span>
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.entries(KOL_THEMES) as [KolThemeKey, typeof KOL_THEMES[KolThemeKey]][]).map(([key, theme]) => {
                        const active = colorTheme === key
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setColorTheme(key)}
                            className={`group relative flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200 font-body ${
                              active
                                ? 'border-white/35 bg-white/[0.06] shadow-[0_0_24px_rgba(140,200,255,0.12)]'
                                : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
                            }`}
                          >
                            {/* Swatch: bg fill + accent diagonal stripe */}
                            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md border border-white/15">
                              <div className="absolute inset-0" style={{ background: theme['--k-hero'] }} />
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
                              <div
                                className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full"
                                style={{ background: theme['--k-accent'], boxShadow: `0 0 8px ${theme['--k-accent']}` }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-base leading-snug text-white/90">{theme.label}</p>
                              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                                {theme['--k-accent']}
                              </p>
                            </div>
                            {active && (
                              <Check className="h-4 w-4 shrink-0 text-white" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <p className="text-sm text-white/55 leading-relaxed font-body">
                    選擇主題後，右側預覽會立即更新。儲存後套用至公開頁面。
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </aside>

        {/* ── RIGHT: LIVE PREVIEW ───────────────────────────── */}
        <div className="hidden lg:flex relative min-h-0 flex-1 flex-col overflow-hidden p-8 pt-16">
          {/* Stage atmosphere */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 50% 20%, rgba(90,140,230,0.10), transparent 70%)',
            }}
          />
          {/* Faint grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              maskImage: 'radial-gradient(ellipse at 50% 30%, black 25%, transparent 75%)',
            }}
          />

          {/* Stage label */}
          <div className="pointer-events-none absolute top-4 left-8 right-8 flex items-center justify-between z-10">
            <span className="inline-flex items-center gap-2 liquid-glass !rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/70 font-body">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-sky-300/70 animate-ping" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-sky-200" />
              </span>
              Live Preview
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-body">
              {viewMode === 'desktop' ? 'Desktop · 桌機' : 'Mobile · 手機'}
            </span>
          </div>

          <div className="relative flex-1 min-h-0 flex items-center justify-center">
            {viewMode === 'desktop' ? (
              <div className="relative w-full max-w-[1280px] h-full flex flex-col">
                <div
                  className="absolute -inset-8 -z-10 rounded-[36px] opacity-60"
                  style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(140,200,255,0.12), transparent 70%)' }}
                />
                <div className="relative flex-1 min-h-0 overflow-hidden rounded-[24px] border border-white/15 shadow-[0_40px_120px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)_inset] bg-white/[0.02] backdrop-blur-sm">
                  <iframe
                    ref={iframeRef}
                    src={`/kols/${resume.username}/frame`}
                    className="block w-full h-full"
                    title="桌機預覽"
                    onLoad={() => pushToFrame(liveResume)}
                  />
                </div>
              </div>
            ) : (
              <div className="relative h-full flex flex-col items-center">
                <div
                  className="absolute -inset-10 -z-10 rounded-[60px] opacity-70"
                  style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(140,200,255,0.14), transparent 70%)' }}
                />
                <div className="relative flex flex-col w-full max-w-[390px] h-full max-h-[calc(100vh-8rem)] overflow-hidden rounded-[44px] border-[6px] border-white/[0.14] bg-black shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
                  <div className="shrink-0 flex h-8 items-center justify-center bg-black">
                    <div className="h-1.5 w-24 rounded-full bg-white/15" />
                  </div>
                  <iframe
                    ref={iframeRef}
                    src={`/kols/${resume.username}/frame`}
                    className="block w-full flex-1 min-h-0"
                    title="手機預覽"
                    onLoad={() => pushToFrame(liveResume)}
                  />
                  <div className="shrink-0 flex h-6 items-center justify-center bg-black">
                    <div className="h-1 w-28 rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
