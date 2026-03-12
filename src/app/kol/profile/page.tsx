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
  profile?: { fullName?: string; bio?: string; profilePhotoUrl?: string | null }
  error?: string
}

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
      setLoading(true); setError('')
      try {
        const res     = await fetch('/api/kol/profile')
        const payload = (await res.json().catch(() => null)) as ProfileResponse | null
        if (!res.ok) { if (active) setError(payload?.error ?? '讀取個人檔案失敗。'); return }
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedPhoto(file)
    setSelectedPreview(URL.createObjectURL(file))
    setSuccess(''); setError('')
    e.target.value = ''
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      const formData = new FormData()
      formData.append('bio', bio)
      if (selectedPhoto) formData.append('profilePhoto', selectedPhoto)
      const res     = await fetch('/api/kol/profile', { method: 'PUT', body: formData })
      const payload = (await res.json().catch(() => null)) as ProfileResponse | null
      if (!res.ok) { setError(payload?.error ?? '儲存失敗，請稍後再試。'); return }
      setProfilePhotoUrl(payload?.profile?.profilePhotoUrl ?? profilePhotoUrl)
      setSelectedPhoto(null); setSelectedPreview(null)
      setSuccess('個人檔案已更新。')
    } catch (e) {
      setError(e instanceof Error ? e.message : '儲存失敗，請稍後再試。')
    } finally {
      setSaving(false)
    }
  }

  const avatarSrc  = selectedPreview ?? profilePhotoUrl
  const bioMax     = 300
  const bioNearMax = bio.length > bioMax * 0.85

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid gap-5 lg:grid-cols-[260px_1fr]"
          >
            <div className="border border-foreground/15 p-6 flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full animate-pulse bg-muted/50" />
              <div className="h-2.5 w-20 rounded animate-pulse bg-muted/40" />
              <div className="h-8 w-28 rounded animate-pulse bg-muted/40" />
            </div>
            <div className="border border-foreground/15 p-6 space-y-5">
              <div className="h-2.5 w-16 rounded animate-pulse bg-muted/40" />
              <div className="h-10 w-full rounded animate-pulse bg-muted/40" />
              <div className="h-2.5 w-16 rounded animate-pulse bg-muted/40" />
              <div className="h-28 w-full rounded animate-pulse bg-muted/40" />
              <div className="flex justify-end">
                <div className="h-10 w-28 rounded animate-pulse bg-muted/40" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={handleSubmit}
            className="grid gap-5 lg:grid-cols-[260px_1fr]"
          >
            {/* ── Avatar panel ── */}
            <div className="border border-foreground/15 p-6 flex flex-col items-center text-center gap-4">
              <p className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground self-start">頭像</p>

              <div className="group relative w-24 h-24 rounded-full overflow-hidden border border-foreground/15 bg-muted/20 flex items-center justify-center">
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarSrc} alt={fullName || 'avatar'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-serif text-muted-foreground select-none">
                    {(fullName || 'K').slice(0, 1)}
                  </span>
                )}
                <label className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 cursor-pointer">
                  <Camera className="h-4 w-4 text-transparent group-hover:text-white transition-colors" />
                  <span className="text-[0.55rem] uppercase tracking-widest text-transparent group-hover:text-white/70 transition-colors">更換</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>

              <div>
                <p className="text-sm font-medium">{fullName || '—'}</p>
                <p className="text-[0.63rem] text-muted-foreground mt-0.5">KOL</p>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 border border-foreground/15 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:border-foreground/35 transition-colors">
                <Camera className="h-3.5 w-3.5" />
                更換頭像
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>

              <p className="text-[0.62rem] text-muted-foreground leading-relaxed">
                建議正方形，至少 512 × 512。
              </p>
            </div>

            {/* ── Fields panel ── */}
            <div className="border border-foreground/15 divide-y divide-foreground/[0.08]">
              <div className="px-5 py-5 space-y-4">
                <p className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground">個人資料</p>

                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <label className="label-editorial">姓名</label>
                    <span className="text-[0.55rem] uppercase tracking-widest text-muted-foreground/50">唯讀</span>
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    disabled
                    className="input-editorial text-sm opacity-60 cursor-not-allowed"
                  />
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <label className="label-editorial">短描述</label>
                    <span className={`text-[0.58rem] tabular-nums transition-colors ${bioNearMax ? 'text-amber-500' : 'text-muted-foreground/50'}`}>
                      {bio.length} / {bioMax}
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

              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-5 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">
                      <XCircle className="h-4 w-4 shrink-0" />{error}
                    </div>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-5 py-3 text-sm text-emerald-700 bg-emerald-50 border-b border-emerald-100">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />{success}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="px-5 py-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-[0.2em] hover:bg-foreground/85 disabled:opacity-60 transition-colors"
                >
                  {saving ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {saving ? '儲存中…' : '儲存變更'}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
