'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CheckCircle2, LoaderCircle, Save, XCircle } from 'lucide-react'

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

type ProfileResponse = {
  profile?: {
    fullName?: string
    bio?: string
    profilePhotoUrl?: string | null
  }
  error?: string
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-foreground/8 ${className ?? ''}`} />
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Left — avatar panel */}
      <div className="border border-[#E8D5BC] p-6 flex flex-col items-center gap-5"
        style={{ background: 'linear-gradient(135deg, #fbf2e6 0%, #f7f4ee 55%, #f1e3d0 100%)' }}
      >
        <div className="w-36 h-36 rounded-full animate-pulse bg-[#D9C4AA]/50" />
        <div className="w-full space-y-2 flex flex-col items-center">
          <div className="h-3 w-24 rounded animate-pulse bg-[#D9C4AA]/50" />
          <div className="h-3 w-16 rounded animate-pulse bg-[#D9C4AA]/50" />
        </div>
        <div className="h-8 w-28 rounded animate-pulse bg-[#D9C4AA]/50" />
      </div>
      {/* Right — fields */}
      <div className="border border-foreground/15 p-6 space-y-6">
        <Skeleton className="h-3 w-20 rounded" />
        <div className="space-y-4">
          <div>
            <Skeleton className="h-2.5 w-8 rounded mb-2" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
          <div>
            <Skeleton className="h-2.5 w-12 rounded mb-2" />
            <Skeleton className="h-28 w-full rounded" />
          </div>
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-28 rounded" />
        </div>
      </div>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function KolProfilePage() {
  const [fullName,        setFullName]        = useState('')
  const [bio,             setBio]             = useState('')
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [selectedPhoto,   setSelectedPhoto]   = useState<File | null>(null)
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null)
  const [loading,         setLoading]         = useState(true)
  const [saving,          setSaving]          = useState(false)
  const [error,           setError]           = useState('')
  const [success,         setSuccess]         = useState('')

  useEffect(() => {
    let active = true
    async function loadProfile() {
      setLoading(true)
      setError('')
      try {
        const response = await fetch('/api/kol/profile')
        const payload = (await response.json().catch(() => null)) as ProfileResponse | null
        if (!response.ok) { if (active) setError(payload?.error ?? '讀取個人檔案失敗。'); return }
        if (!active) return
        setFullName(payload?.profile?.fullName ?? '')
        setBio(payload?.profile?.bio ?? '')
        setProfilePhotoUrl(payload?.profile?.profilePhotoUrl ?? null)
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : '讀取個人檔案失敗。')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadProfile()
    return () => { active = false }
  }, [])

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedPhoto(file)
    setSelectedPreview(URL.createObjectURL(file))
    setSuccess('')
    setError('')
    event.target.value = ''
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const formData = new FormData()
      formData.append('bio', bio)
      if (selectedPhoto) formData.append('profilePhoto', selectedPhoto)
      const response = await fetch('/api/kol/profile', { method: 'PUT', body: formData })
      const payload = (await response.json().catch(() => null)) as ProfileResponse | null
      if (!response.ok) { setError(payload?.error ?? '儲存失敗，請稍後再試。'); return }
      setProfilePhotoUrl(payload?.profile?.profilePhotoUrl ?? profilePhotoUrl)
      setSelectedPhoto(null)
      setSelectedPreview(null)
      setSuccess('個人檔案已更新。')
    } catch (e) {
      setError(e instanceof Error ? e.message : '儲存失敗，請稍後再試。')
    } finally {
      setSaving(false)
    }
  }

  const avatarSrc  = selectedPreview ?? profilePhotoUrl
  const bioMax     = 300
  const bioLen     = bio.length
  const bioNearMax = bioLen > bioMax * 0.85

  return (
    <div className="space-y-8">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">KOL 檔案</p>
        <h1 className="text-3xl font-serif">編輯個人檔案</h1>
        <p className="text-sm text-muted-foreground mt-2">
          管理你的頭像與簡短介紹，商家瀏覽時第一眼就會看到。
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ProfileSkeleton />
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={handleSubmit}
            className="grid gap-6 lg:grid-cols-[280px_1fr]"
          >
            {/* ── Avatar panel ── */}
            <section
              className="border border-[#E8D5BC] p-6 flex flex-col items-center text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #fbf2e6 0%, #f7f4ee 55%, #f1e3d0 100%)' }}
            >
              {/* Subtle dot texture */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.35] pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(26,26,26,0.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              <div className="relative z-10 flex flex-col items-center gap-5 w-full">
                <p className="text-[0.62rem] uppercase tracking-[0.3em] text-[#B5886C] self-start">頭像</p>

                {/* Avatar with camera hover */}
                <div className="group relative w-36 h-36 rounded-full overflow-hidden border-2 border-[#D9C4AA] shadow-sm bg-[#EDD9C4]/40 flex items-center justify-center">
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarSrc} alt={fullName || 'KOL avatar'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-serif text-[#B5886C]/60 select-none">
                      {(fullName || 'K').slice(0, 1)}
                    </span>
                  )}
                  {/* Hover overlay */}
                  <label className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/0 group-hover:bg-black/35 transition-colors duration-200 cursor-pointer">
                    <Camera className="h-5 w-5 text-transparent group-hover:text-white transition-colors duration-200" />
                    <span className="text-[0.58rem] uppercase tracking-widest text-transparent group-hover:text-white/80 transition-colors duration-200">更換</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>

                {/* Name + hint */}
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-[#1A1A1A]">{fullName || '—'}</p>
                  <p className="text-[0.63rem] text-[#7A6A5A]">KOL</p>
                </div>

                {/* Explicit change button */}
                <label className="inline-flex cursor-pointer items-center gap-2 border border-[#B5886C] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#B5886C] hover:bg-[#B5886C] hover:text-white transition-colors duration-150">
                  <Camera className="h-3.5 w-3.5" />
                  更換頭像
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>

                <p className="text-[0.62rem] text-[#7A6A5A] leading-relaxed max-w-[180px]">
                  建議正方形照片，至少 512 × 512。
                </p>
              </div>
            </section>

            {/* ── Info panel ── */}
            <section className="border border-foreground/15 p-6 space-y-6">
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">個人資料</p>

              <div className="space-y-4">
                {/* Name — read only */}
                <div>
                  <label className="label-editorial">姓名</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      disabled
                      className="input-editorial text-sm opacity-60 cursor-not-allowed"
                    />
                    <span className="absolute right-0 bottom-3.5 text-[0.55rem] uppercase tracking-widest text-muted-foreground/50">唯讀</span>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <label className="label-editorial">短描述</label>
                    <span className={`text-[0.58rem] tabular-nums transition-colors ${bioNearMax ? 'text-amber-500' : 'text-muted-foreground/50'}`}>
                      {bioLen} / {bioMax}
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={bio}
                    maxLength={bioMax}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="描述你的受眾、內容方向與風格，讓商家快速了解你的定位。"
                    className="input-editorial text-sm resize-none"
                  />
                </div>
              </div>

              {/* Feedback messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2 text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2.5"
                  >
                    <XCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2 text-sm text-emerald-700 border border-emerald-200 bg-emerald-50 px-3 py-2.5"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end pt-2 border-t border-foreground/8">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-[0.2em] hover:bg-foreground/85 disabled:opacity-60 transition-colors"
                >
                  {saving ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {saving ? '儲存中…' : '儲存變更'}
                </button>
              </div>
            </section>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
