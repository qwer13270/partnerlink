'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Save, Play } from 'lucide-react'
import type { KolResumeData, SocialLinks } from '@/data/mock-resume'

type Props = {
  open: boolean
  resume: KolResumeData
  onClose: () => void
  onSave: (updated: KolResumeData) => void
}

const SOCIAL_PLATFORMS: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/@...' },
  { key: 'tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@...' },
  { key: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/...' },
  { key: 'website',   label: '個人網站',  placeholder: 'https://...' },
]

export default function KolResumeEditPanel({ open, resume, onClose, onSave }: Props) {
  const [bio,           setBio]           = useState(resume.bio)
  const [followerCount, setFollowerCount] = useState(String(resume.followerCount))
  const [nicheTags,     setNicheTags]     = useState<string[]>(resume.nicheTags)
  const [tagInput,      setTagInput]      = useState('')
  const [socialLinks,   setSocialLinks]   = useState<SocialLinks>(resume.socialLinks)
  const [captions,      setCaptions]      = useState<Record<string, string>>(
    Object.fromEntries(resume.media.map((m) => [m.id, m.caption]))
  )

  // Re-sync state when resume prop changes (e.g. parent saves and re-opens)
  useEffect(() => {
    if (open) {
      setBio(resume.bio)
      setFollowerCount(String(resume.followerCount))
      setNicheTags(resume.nicheTags)
      setSocialLinks(resume.socialLinks)
      setCaptions(Object.fromEntries(resume.media.map((m) => [m.id, m.caption])))
      setTagInput('')
    }
  }, [open, resume])

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !nicheTags.includes(t)) setNicheTags((prev) => [...prev, t])
    setTagInput('')
  }

  const removeTag = (tag: string) => setNicheTags((prev) => prev.filter((t) => t !== tag))

  const handleSave = () => {
    const updated: KolResumeData = {
      ...resume,
      bio,
      followerCount: Math.max(0, parseInt(followerCount, 10) || 0),
      nicheTags,
      socialLinks,
      media: resume.media.map((m) => ({ ...m, caption: captions[m.id] ?? m.caption })),
    }
    onSave(updated)
  }

  const photos = resume.media.filter((m) => m.mediaType === 'image')
  const videos = resume.media.filter((m) => m.mediaType === 'video')
  const bioMax = 400

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[101] w-full max-w-md bg-background border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/10 shrink-0">
              <div>
                <p className="text-[0.55rem] uppercase tracking-[0.4em] text-muted-foreground">
                  KOL 履歷
                </p>
                <p className="text-sm font-medium mt-0.5">編輯個人資料</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="關閉"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Section: 基本資料 ── */}
              <div className="px-6 py-6 border-b border-foreground/8 space-y-5">
                <p className="text-[0.56rem] uppercase tracking-[0.45em] text-muted-foreground">
                  基本資料
                </p>

                {/* Bio */}
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <label className="text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
                      自我介紹
                    </label>
                    <span className={`text-[0.58rem] tabular-nums ${bio.length > bioMax * 0.85 ? 'text-amber-500' : 'text-muted-foreground/50'}`}>
                      {bio.length} / {bioMax}
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={bio}
                    maxLength={bioMax}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="描述你的受眾、內容方向與風格。"
                    className="w-full border border-foreground/15 bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/40"
                  />
                </div>

                {/* Follower count */}
                <div>
                  <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                    追蹤者人數
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={followerCount}
                    onChange={(e) => setFollowerCount(e.target.value)}
                    className="w-full border border-foreground/15 bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
                  />
                </div>

                {/* Niche tags */}
                <div>
                  <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                    專長標籤
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {nicheTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 border border-foreground/20 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.15em]"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-muted-foreground hover:text-foreground transition-colors ml-0.5"
                          aria-label={`移除 ${tag}`}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                      placeholder="輸入後按 Enter 新增"
                      className="flex-1 border border-foreground/15 bg-background px-3 py-2 text-xs focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/40"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="p-2 border border-foreground/15 text-muted-foreground hover:text-foreground hover:border-foreground/35 transition-colors"
                      aria-label="新增標籤"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Section: 社群連結 ── */}
              <div className="px-6 py-6 border-b border-foreground/8 space-y-4">
                <p className="text-[0.56rem] uppercase tracking-[0.45em] text-muted-foreground">
                  社群連結
                </p>
                {SOCIAL_PLATFORMS.map((p) => (
                  <div key={p.key}>
                    <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                      {p.label}
                    </label>
                    <input
                      type="url"
                      value={socialLinks[p.key] ?? ''}
                      onChange={(e) => setSocialLinks((prev) => ({ ...prev, [p.key]: e.target.value || undefined }))}
                      placeholder={p.placeholder}
                      className="w-full border border-foreground/15 bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/40"
                    />
                  </div>
                ))}
              </div>

              {/* ── Section: 媒體說明 ── */}
              {resume.media.length > 0 && (
                <div className="px-6 py-6 space-y-5">
                  <p className="text-[0.56rem] uppercase tracking-[0.45em] text-muted-foreground">
                    媒體說明
                  </p>

                  {photos.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground/60">
                        照片 · {photos.length} 張
                      </p>
                      {photos.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-14 h-14 shrink-0 bg-muted/30 border border-foreground/8 overflow-hidden flex items-center justify-center">
                            {item.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.url}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const el = e.currentTarget as HTMLImageElement
                                  el.style.display = 'none'
                                }}
                              />
                            ) : (
                              <span className="text-[0.5rem] text-muted-foreground/40">圖</span>
                            )}
                          </div>
                          <textarea
                            rows={2}
                            value={captions[item.id] ?? ''}
                            onChange={(e) => setCaptions((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder="這張照片的說明文字…"
                            className="flex-1 border border-foreground/15 bg-background px-2.5 py-2 text-xs resize-none focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/40"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {videos.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground/60">
                        影片 · {videos.length} 支
                      </p>
                      {videos.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div
                            className="w-14 h-14 shrink-0 border border-foreground/8 flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #1C2530 0%, #2E4052 100%)' }}
                          >
                            <Play className="h-3.5 w-3.5 text-white/60 fill-white/60" />
                          </div>
                          <textarea
                            rows={2}
                            value={captions[item.id] ?? ''}
                            onChange={(e) => setCaptions((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder="這支影片的說明文字…"
                            className="flex-1 border border-foreground/15 bg-background px-2.5 py-2 text-xs resize-none focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/40"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-foreground/10 shrink-0">
              <button
                onClick={onClose}
                className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-foreground px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.2em] text-background hover:bg-foreground/85 transition-colors"
              >
                <Save className="h-3 w-3" />
                儲存變更
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
