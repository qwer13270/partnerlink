'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, LoaderCircle, CheckCircle2 } from 'lucide-react'

interface ProfilePhotoModalProps {
  open: boolean
  onClose: () => void
  currentPhotoUrl: string | null
  displayName: string
  onPhotoUpdated: (url: string | null) => void
}

export default function ProfilePhotoModal({
  open,
  onClose,
  currentPhotoUrl,
  displayName,
  onPhotoUpdated,
}: ProfilePhotoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview,      setPreview]      = useState<string | null>(null)
  const [saving,       setSaving]       = useState(false)
  const [success,      setSuccess]      = useState(false)
  const [error,        setError]        = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File) => {
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setError('')
    setSuccess(false)
  }

  const handleConfirm = async () => {
    if (!selectedFile) return
    setSaving(true)
    setError('')

    try {
      // Fetch current bio first so we don't overwrite it
      const profileRes  = await fetch('/api/kol/profile')
      const profileData = (await profileRes.json().catch(() => null)) as {
        profile?: { bio?: string }
      } | null
      const currentBio = profileData?.profile?.bio ?? ''

      const formData = new FormData()
      formData.append('bio', currentBio)
      formData.append('profilePhoto', selectedFile)

      const res     = await fetch('/api/kol/profile', { method: 'PUT', body: formData })
      const payload = (await res.json().catch(() => null)) as {
        profile?: { profilePhotoUrl?: string | null }
        error?: string
      } | null

      if (!res.ok) {
        setError(payload?.error ?? '儲存失敗，請稍後再試。')
        return
      }

      const newUrl = payload?.profile?.profilePhotoUrl ?? null
      onPhotoUpdated(newUrl)
      window.dispatchEvent(
        new CustomEvent('profile-photo-updated', { detail: { url: newUrl } }),
      )
      setSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 900)
    } catch (e) {
      setError(e instanceof Error ? e.message : '儲存失敗，請稍後再試。')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (saving) return
    setSelectedFile(null)
    setPreview(null)
    setError('')
    setSuccess(false)
    onClose()
  }

  const avatarSrc = preview ?? currentPhotoUrl
  const initial   = (displayName || 'K').slice(0, 1).toUpperCase()

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-foreground/25 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.97, y: 10  }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-[360px] bg-background border border-foreground/15 shadow-2xl">

              {/* ── Title bar ── */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/10">
                <div>
                  <p className="text-[0.54rem] uppercase tracking-[0.45em] text-muted-foreground">
                    個人頭像
                  </p>
                  <p className="text-sm font-medium mt-0.5">更換大頭照</p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={saving}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                  aria-label="關閉"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* ── Photo area ── */}
              <div className="px-6 py-8 flex flex-col items-center gap-6">

                {/* Avatar preview */}
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden border border-foreground/15 bg-muted/30 flex items-center justify-center">
                    {avatarSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarSrc}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-serif text-muted-foreground select-none">
                        {initial}
                      </span>
                    )}
                  </div>

                  {/* New-photo indicator */}
                  <AnimatePresence>
                    {preview && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-emerald-500"
                      >
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* File picker zone */}
                <label className="group flex w-full cursor-pointer flex-col items-center gap-2 border border-dashed border-foreground/20 px-4 py-5 transition-all duration-200 hover:border-foreground/40 hover:bg-foreground/[0.02]">
                  <Camera className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                  <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                    {preview ? '重新選擇圖片' : '點擊選擇圖片'}
                  </span>
                  <span className="text-[0.6rem] text-muted-foreground/50">
                    JPG、PNG，最大 10 MB
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileChange(file)
                      e.target.value = ''
                    }}
                  />
                </label>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-red-600 text-center"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Footer actions ── */}
              <div className="flex items-center justify-between border-t border-foreground/10 px-5 py-4">
                <button
                  onClick={handleClose}
                  disabled={saving}
                  className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                >
                  取消
                </button>

                <button
                  onClick={handleConfirm}
                  disabled={!selectedFile || saving || success}
                  className="flex items-center gap-2 bg-foreground px-5 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-background transition-colors hover:bg-foreground/85 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? (
                    <>
                      <LoaderCircle className="h-3 w-3 animate-spin" />
                      上傳中…
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      已更新
                    </>
                  ) : (
                    '確認更換'
                  )}
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
