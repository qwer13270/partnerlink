'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ImagePlus, Plus } from 'lucide-react'
import { slideIn, fadeUp } from '../_constants'
import { getUploadKey } from '../_upload'
import type { KolMediaDraft, UploadProgressMap } from '../_types'

export function KolMediaStep({
  onBack,
  onSubmit,
  error,
  submitting,
  uploadProgress,
}: {
  onBack: () => void
  onSubmit: (media: KolMediaDraft) => void
  error: string
  submitting: boolean
  uploadProgress: UploadProgressMap
}) {
  const profileInputRef = useRef<HTMLInputElement>(null)
  const [profilePhoto, setProfilePhoto] = useState<{ file: File; preview: string } | null>(null)

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setProfilePhoto({ file: selected, preview: URL.createObjectURL(selected) })
    e.target.value = ''
  }

  return (
    <motion.div key="step3-kol" {...slideIn}>
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-[#6B6560] hover:text-[#1A1A1A] transition-colors mb-4">
          <span className="rotate-180 inline-block">→</span> 返回
        </button>
        <h2 className="text-3xl font-serif text-[#1A1A1A] mb-1">上傳個人頭像</h2>
        <p className="text-sm text-[#6B6560]">管理員會用這張照片辨識你的申請，作品照片與影片可在核准後再補上。</p>
      </motion.div>

      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="p-4 bg-[#FFF8EE] border border-[#F0D9A8] mb-6">
          <p className="text-xs font-medium text-[#7A5520] uppercase tracking-widest mb-1">審核階段</p>
          <p className="text-xs text-[#9A7040] leading-relaxed">
            目前只需要完成基本資料與個人頭像。通過審核後，你可以登入 KOL 後台再補完整作品集。
          </p>
        </div>
      </motion.div>

      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <label className="label-editorial flex items-center gap-2">
            <ImagePlus className="h-3.5 w-3.5" />
            個人頭像
          </label>
          <span className="text-[0.65rem] text-[#A15B49]">必填</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => profileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-full border border-dashed border-[#D8D4CF] overflow-hidden flex items-center justify-center text-[#C0BAB3] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors duration-200"
          >
            {profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profilePhoto.preview} alt="" className="w-full h-full object-cover" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
          <div>
            <p className="text-xs text-[#6B6560]">請上傳清晰正面照片，將作為申請列表圓形頭像。</p>
            <p className="text-[0.65rem] text-[#9A9288] mt-1">建議尺寸：至少 512 × 512</p>
          </div>
        </div>
        <input
          ref={profileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleProfileChange}
        />
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 mb-4"
        >
          {error}
        </motion.p>
      )}

      <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="space-y-3">
        {(() => {
          const uploadKey = profilePhoto ? `profile-${getUploadKey('image', 0, profilePhoto.file)}` : null
          const state = uploadKey ? uploadProgress[uploadKey] : null
          if (!state) return null

          const statusText =
            state.status === 'uploading'
              ? `頭像上傳中 ${state.progress}%`
              : state.status === 'success'
                ? '頭像上傳完成'
                : state.status === 'error'
                  ? `頭像上傳失敗${state.error ? `：${state.error}` : ''}`
                  : '等待上傳'

          return (
            <p className={`text-xs text-center ${state.status === 'error' ? 'text-red-500' : 'text-[#6B6560]'}`}>
              {statusText}
            </p>
          )
        })()}
        <button
          type="button"
          onClick={() => onSubmit({ profilePhoto: profilePhoto?.file ?? null })}
          disabled={submitting || !profilePhoto}
          className="group relative overflow-hidden w-full flex items-center justify-between px-6 py-4 bg-[#1A1A1A] text-[#FAF9F6] text-sm uppercase tracking-widest hover:bg-[#2A2A2A] disabled:opacity-90 transition-colors duration-300"
        >
          {submitting && (
            <motion.span
              initial={{ x: '-120%' }}
              animate={{ x: '120%' }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              className="pointer-events-none absolute inset-y-0 w-1/3 bg-white/15 blur-sm"
            />
          )}
          <span>{submitting ? '送出中…' : '送出申請'}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
        {!profilePhoto && (
          <p className="text-xs text-[#A15B49] text-center">請先上傳個人頭像</p>
        )}
      </motion.div>
    </motion.div>
  )
}
