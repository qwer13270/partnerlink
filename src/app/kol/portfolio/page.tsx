'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Film, ImagePlus, LoaderCircle, Sparkles, Trash2, UploadCloud } from 'lucide-react'

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
    summary: {
      totalPhotos: number
      totalVideos: number
    }
  }
  asset?: PortfolioAsset
  error?: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
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
  file,
  mediaType,
  sortOrder,
  onProgress,
}: {
  file: File
  mediaType: 'image' | 'video'
  sortOrder: number
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
      const progress = Math.min(100, Math.round((event.loaded / event.total) * 100))
      onProgress(progress)
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

export default function KolPortfolioPage() {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<PortfolioAsset[]>([])
  const [videos, setVideos] = useState<PortfolioAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadStates, setUploadStates] = useState<UploadState[]>([])
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null)

  const totalAssets = photos.length + videos.length

  const summary = useMemo(() => ([
    { label: '作品照片', value: photos.length.toString().padStart(2, '0'), tone: 'from-[#D89B6B] to-[#F2C28E]' },
    { label: '作品影片', value: videos.length.toString().padStart(2, '0'), tone: 'from-[#4F6D7A] to-[#7FA6B8]' },
    { label: '完整度', value: totalAssets > 0 ? '已啟用' : '待補齊', tone: 'from-[#1A1A1A] to-[#56524D]' },
  ]), [photos.length, totalAssets, videos.length])

  useEffect(() => {
    let active = true

    async function loadPortfolio() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/kol/portfolio', { cache: 'no-store' })
        const payload = (await response.json().catch(() => null)) as PortfolioResponse | null
        if (!response.ok) {
          if (active) setError(payload?.error ?? '讀取作品集失敗。')
          return
        }

        if (!active) return
        setPhotos(payload?.portfolio?.photos ?? [])
        setVideos(payload?.portfolio?.videos ?? [])
      } catch (caughtError) {
        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : '讀取作品集失敗。')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPortfolio()

    return () => {
      active = false
    }
  }, [])

  const upsertUploadState = (nextState: UploadState) => {
    setUploadStates((prev) => {
      const existingIndex = prev.findIndex((state) => state.key === nextState.key)
      if (existingIndex === -1) return [...prev, nextState]
      const next = [...prev]
      next[existingIndex] = nextState
      return next
    })
  }

  const removeUploadState = (key: string) => {
    setUploadStates((prev) => prev.filter((state) => state.key !== key))
  }

  const handleFilesSelected = async (mediaType: 'image' | 'video', files: File[]) => {
    if (files.length === 0) return
    setError('')
    const baseCount = mediaType === 'image' ? photos.length : videos.length

    for (const [index, file] of files.entries()) {
      const key = `${mediaType}-${file.name}-${file.size}-${crypto.randomUUID()}`
      const nextSortOrder = baseCount + index

      upsertUploadState({
        key,
        fileName: file.name,
        mediaType,
        progress: 0,
        status: 'uploading',
      })

      try {
        const asset = await uploadPortfolioFile({
          file,
          mediaType,
          sortOrder: nextSortOrder,
          onProgress: (progress) => {
            upsertUploadState({
              key,
              fileName: file.name,
              mediaType,
              progress,
              status: 'uploading',
            })
          },
        })

        if (mediaType === 'image') {
          setPhotos((prev) => [...prev, asset].sort((a, b) => a.sortOrder - b.sortOrder))
        } else {
          setVideos((prev) => [...prev, asset].sort((a, b) => a.sortOrder - b.sortOrder))
        }
        removeUploadState(key)
      } catch (caughtError) {
        upsertUploadState({
          key,
          fileName: file.name,
          mediaType,
          progress: 0,
          status: 'error',
          error: caughtError instanceof Error ? caughtError.message : '上傳失敗',
        })
        setError(caughtError instanceof Error ? caughtError.message : '上傳失敗')
      }
    }
  }

  const handleDelete = async (asset: PortfolioAsset) => {
    setDeletingAssetId(asset.id)
    setError('')

    try {
      const response = await fetch('/api/kol/portfolio', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assetId: asset.id }),
      })

      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        setError(payload?.error ?? '刪除失敗，請稍後再試。')
        return
      }

      if (asset.mediaType === 'image') {
        setPhotos((prev) => prev.filter((item) => item.id !== asset.id))
      } else {
        setVideos((prev) => prev.filter((item) => item.id !== asset.id))
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '刪除失敗，請稍後再試。')
    } finally {
      setDeletingAssetId(null)
    }
  }

  return (
    <div className="space-y-8">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="relative overflow-hidden border border-foreground/15 bg-[#F7F1E7] p-7 lg:p-9">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(216,155,107,0.18),_transparent_58%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-[#7A6B59] mb-2">作品集管理</p>
            <h1 className="text-3xl lg:text-4xl font-serif text-[#1A1A1A]">把你的作品整理成一個能被商家快速判斷的門面。</h1>
            <p className="mt-3 text-sm text-[#6A6258] leading-relaxed">
              上傳照片與影片後，管理員與商家在後台看到的會更完整。先放最能代表你的作品，之後再慢慢擴充。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:min-w-[360px]">
            {summary.map((item) => (
              <div key={item.label} className="border border-black/10 bg-white/70 p-4 backdrop-blur-sm">
                <div className={`h-1 w-full bg-gradient-to-r ${item.tone}`} />
                <p className="mt-4 text-[0.65rem] uppercase tracking-[0.25em] text-[#7A6B59]">{item.label}</p>
                <p className="mt-2 text-2xl font-serif text-[#1A1A1A]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="border border-foreground/15 bg-[#FBF8F2] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">建議順序</p>
              <h2 className="mt-2 text-xl font-serif">先放 6 張代表作品，再補 1 到 3 支短影片</h2>
            </div>
            <Sparkles className="h-4 w-4 text-[#B27A4A] shrink-0" />
          </div>
          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            <p>照片適合放空間感、人物互動、品牌合作結果。</p>
            <p>影片適合放口播、導覽、開箱，讓商家更容易判斷你的鏡頭表現。</p>
            <p>若作品還不多，先上傳最強的幾個案例就夠了。</p>
          </div>
        </section>

        <section className="border border-foreground/15 p-6 bg-white">
          <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">快速操作</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="group border border-[#D9C6B4] bg-[#FAF3EA] px-4 py-4 text-left transition-colors hover:bg-[#F2E6D8]"
            >
              <ImagePlus className="h-4 w-4 text-[#9D6D45]" />
              <p className="mt-3 text-sm font-medium text-[#1A1A1A]">新增照片</p>
              <p className="mt-1 text-xs text-[#7A6B59]">JPG / PNG，單檔上限 10MB</p>
            </button>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="group border border-[#BFD1DA] bg-[#EEF5F8] px-4 py-4 text-left transition-colors hover:bg-[#E2EEF3]"
            >
              <Film className="h-4 w-4 text-[#4F6D7A]" />
              <p className="mt-3 text-sm font-medium text-[#1A1A1A]">新增影片</p>
              <p className="mt-1 text-xs text-[#637985]">MP4 / MOV，單檔上限 100MB</p>
            </button>
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              void handleFilesSelected('image', Array.from(event.target.files ?? []))
              event.target.value = ''
            }}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(event) => {
              void handleFilesSelected('video', Array.from(event.target.files ?? []))
              event.target.value = ''
            }}
          />
        </section>
      </motion.div>

      {uploadStates.length > 0 && (
        <motion.section custom={2} initial="hidden" animate="visible" variants={fadeUp} className="border border-foreground/15 bg-white p-5">
          <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
            <UploadCloud className="h-3.5 w-3.5" />
            上傳進度
          </div>
          <div className="mt-4 space-y-3">
            {uploadStates.map((state) => (
              <div key={state.key} className="border border-foreground/10 bg-[#FCFBF8] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{state.fileName}</p>
                    <p className={`mt-1 text-xs ${state.status === 'error' ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {state.status === 'uploading' ? `上傳中 ${state.progress}%` : state.error ?? '上傳失敗'}
                    </p>
                  </div>
                  {state.status === 'uploading' ? <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
                </div>
                <div className="mt-3 h-1.5 bg-black/8">
                  <div
                    className={`h-full transition-all duration-300 ${state.status === 'error' ? 'bg-red-500' : 'bg-[#1A1A1A]'}`}
                    style={{ width: `${state.status === 'error' ? 100 : state.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {error && (
        <motion.p custom={3} initial="hidden" animate="visible" variants={fadeUp} className="text-sm text-red-600">
          {error}
        </motion.p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <motion.section custom={4} initial="hidden" animate="visible" variants={fadeUp} className="border border-foreground/15 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">照片</p>
              <h2 className="mt-2 text-xl font-serif">作品照片庫</h2>
            </div>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="inline-flex items-center gap-2 border border-foreground/15 px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground/35 transition-colors"
            >
              上傳
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-square animate-pulse bg-muted/40" />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="mt-6 border border-dashed border-foreground/15 bg-[#FBF8F2] p-8 text-center">
              <ImagePlus className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-4 text-sm font-medium">還沒有作品照片</p>
              <p className="mt-2 text-xs text-muted-foreground">先上傳幾張最能代表你合作質感的內容。</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative aspect-square overflow-hidden border border-foreground/10 bg-[#F7F3ED]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={photo.fileName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-white">
                    <p className="truncate text-xs font-medium">{photo.fileName}</p>
                    <p className="mt-1 text-[0.65rem] text-white/70">{formatBytes(photo.fileSizeBytes)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDelete(photo)}
                    disabled={deletingAssetId === photo.id}
                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
                  >
                    {deletingAssetId === photo.id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section custom={5} initial="hidden" animate="visible" variants={fadeUp} className="border border-foreground/15 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">影片</p>
              <h2 className="mt-2 text-xl font-serif">作品影片庫</h2>
            </div>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="inline-flex items-center gap-2 border border-foreground/15 px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground/35 transition-colors"
            >
              上傳
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse bg-muted/40" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="mt-6 border border-dashed border-foreground/15 bg-[#F4F8FA] p-8 text-center">
              <Film className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-4 text-sm font-medium">還沒有作品影片</p>
              <p className="mt-2 text-xs text-muted-foreground">可以先上傳導覽、口播或合作短片。</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {videos.map((video) => (
                <div key={video.id} className="border border-foreground/10 bg-[#FBFBFA] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F0F3] text-[#4F6D7A]">
                        <Film className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{video.fileName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatBytes(video.fileSizeBytes)}</p>
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-[0.2em] text-[#4F6D7A] hover:text-[#2F4650]"
                        >
                          開啟影片
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(video)}
                      disabled={deletingAssetId === video.id}
                      className="inline-flex h-9 w-9 items-center justify-center border border-foreground/10 text-muted-foreground hover:text-foreground hover:border-foreground/30 disabled:opacity-70"
                    >
                      {deletingAssetId === video.id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  )
}
