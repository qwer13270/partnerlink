'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, LoaderCircle, Save } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
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

export default function KolProfilePage() {
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true

    async function loadProfile() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/kol/profile')
        const payload = (await response.json().catch(() => null)) as ProfileResponse | null

        if (!response.ok) {
          if (active) setError(payload?.error ?? '讀取個人檔案失敗。')
          return
        }

        if (!active) return

        setFullName(payload?.profile?.fullName ?? '')
        setBio(payload?.profile?.bio ?? '')
        setProfilePhotoUrl(payload?.profile?.profilePhotoUrl ?? null)
      } catch (caughtError) {
        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : '讀取個人檔案失敗。')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProfile()

    return () => {
      active = false
    }
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
      if (selectedPhoto) {
        formData.append('profilePhoto', selectedPhoto)
      }

      const response = await fetch('/api/kol/profile', {
        method: 'PUT',
        body: formData,
      })

      const payload = (await response.json().catch(() => null)) as ProfileResponse | null
      if (!response.ok) {
        setError(payload?.error ?? '儲存失敗，請稍後再試。')
        return
      }

      setProfilePhotoUrl(payload?.profile?.profilePhotoUrl ?? profilePhotoUrl)
      setSelectedPhoto(null)
      setSelectedPreview(null)
      setSuccess('個人檔案已更新。')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '儲存失敗，請稍後再試。')
    } finally {
      setSaving(false)
    }
  }

  const avatarSrc = selectedPreview ?? profilePhotoUrl

  return (
    <div className="space-y-8">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">KOL 檔案</p>
        <h1 className="text-3xl font-serif">編輯個人檔案</h1>
        <p className="text-sm text-muted-foreground mt-2">
          先管理個人頭像與簡短介紹，其他作品照片與影片後續再補上。
        </p>
      </motion.div>

      <motion.form
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[280px_1fr]"
      >
        <section className="border border-foreground/15 bg-[#FBF8F2] p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground mb-5">頭像</p>
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border border-foreground/10 bg-muted/30 flex items-center justify-center">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSrc} alt={fullName || 'KOL avatar'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-serif text-muted-foreground">
                  {(fullName || 'K').slice(0, 1)}
                </span>
              )}
            </div>

            <label className="mt-5 inline-flex cursor-pointer items-center gap-2 border border-foreground/15 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:border-foreground/35 transition-colors">
              <Camera className="h-3.5 w-3.5" />
              更換頭像
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>

            <p className="text-[0.65rem] text-muted-foreground mt-3">
              顯示於網站右上角頭像與未來個人檔案頁。
            </p>
          </div>
        </section>

        <section className="border border-foreground/15 p-6 space-y-6">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground mb-5">個人資料</p>
            <div className="space-y-4">
              <div>
                <label className="label-editorial">姓名</label>
                <input
                  type="text"
                  value={fullName}
                  disabled
                  className="input-editorial text-sm opacity-70"
                />
              </div>

              <div>
                <label className="label-editorial">短描述</label>
                <textarea
                  rows={5}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="描述你的受眾、內容方向與風格。"
                  className="input-editorial text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {success && (
            <p className="text-sm text-emerald-700">{success}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || saving}
              className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-3 text-xs uppercase tracking-[0.2em] hover:bg-foreground/85 disabled:opacity-60 transition-colors"
            >
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? '讀取中' : saving ? '儲存中' : '儲存變更'}
            </button>
          </div>
        </section>
      </motion.form>
    </div>
  )
}
