'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X, Eye, EyeOff, Building2, Mic2, ImagePlus, Film, Sparkles, Plus } from 'lucide-react'
import { resolveRoleHomePath } from '@/lib/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

// ── Animation variants ─────────────────────────────────────────────────────
const slideIn = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -24 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Types ──────────────────────────────────────────────────────────────────
type Role = 'kol' | 'merchant' | null
type Step = 1 | 2 | 3

// ── Left panel content by role ─────────────────────────────────────────────
const LEFT_CONTENT = {
  null: {
    eyebrow: '加入 HomeKey',
    headline: '選擇你的\n合作身份',
    desc: '無論你是內容創作者或商案商家，HomeKey 都有專屬方案等你加入。',
    stats: [
      { value: '120+', label: '合作 KOL' },
      { value: '18+',  label: '精選商案' },
      { value: '18.4%', label: '平均轉換率' },
    ],
  },
  kol: {
    eyebrow: 'KOL 合作計畫',
    headline: '用影響力\n創造收益',
    desc: '推廣頂級商案，每次成交都為你帶來透明可追蹤的佣金收入。',
    stats: [
      { value: 'NT$65k+', label: '月均收益' },
      { value: '18+',     label: '精選商案' },
      { value: '72%',     label: '目標達成率' },
    ],
  },
  merchant: {
    eyebrow: '商家合作計畫',
    headline: '讓 KOL 成為\n你的銷售引擎',
    desc: '精準觸及有消費意願的買家，成效透明，只在成交後支付佣金。',
    stats: [
      { value: '120+',  label: '合作 KOL' },
      { value: '12,400', label: '月均觸及' },
      { value: '6.5%',  label: '成交轉換率' },
    ],
  },
}

// ── Platform options ───────────────────────────────────────────────────────
const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'Facebook', 'Line', '其他']
const FOLLOWER_RANGES = ['1萬以下', '1–5萬', '5–20萬', '20–100萬', '100萬以上']
const CONTENT_TYPES = ['商品', '生活風格', '財經理財', '旅遊', '美食', '其他']
const CITIES = ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市', '其他']
const PROJECT_COUNTS = ['1 個', '2–3 個', '4–6 個', '7 個以上']

// ── Step indicator ─────────────────────────────────────────────────────────
function StepDots({ step, total = 2 }: { step: Step; total?: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
        <div
          key={s}
          className={`h-1 rounded-full transition-all duration-300 ${
            s === step ? 'w-6 bg-[#1A1A1A]' : s < step ? 'w-3 bg-[#1A1A1A]/30' : 'w-3 bg-[#E8E4DF]'
          }`}
        />
      ))}
    </div>
  )
}

// ── Step 1 — Role selection ────────────────────────────────────────────────
function RoleStep({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <motion.div key="step1" {...slideIn}>
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
        <h2 className="text-3xl font-serif text-[#1A1A1A] mb-2">你是？</h2>
        <p className="text-sm text-[#6B6560]">請選擇你的合作身份以繼續</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {/* KOL card */}
        <motion.button
          custom={1} initial="hidden" animate="visible" variants={fadeUp}
          onClick={() => onSelect('kol')}
          className="group text-left border border-[#E8E4DF] p-6 hover:border-[#1A1A1A] hover:bg-[#1A1A1A] transition-all duration-300"
        >
          <div className="w-10 h-10 border border-[#E8E4DF] group-hover:border-white/20 flex items-center justify-center mb-5 transition-colors duration-300">
            <Mic2 className="h-4 w-4 text-[#6B6560] group-hover:text-white transition-colors duration-300" />
          </div>
          <div className="text-sm font-medium text-[#1A1A1A] group-hover:text-white mb-2 transition-colors duration-300">KOL 創作者</div>
          <div className="text-xs text-[#6B6560] group-hover:text-white/50 leading-relaxed transition-colors duration-300">
            推廣商案並賺取透明佣金
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-[#6B6560] group-hover:text-white/60 transition-colors duration-300">
            立即加入
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </motion.button>

        {/* Merchant card */}
        <motion.button
          custom={2} initial="hidden" animate="visible" variants={fadeUp}
          onClick={() => onSelect('merchant')}
          className="group text-left border border-[#E8E4DF] p-6 hover:border-[#1A1A1A] hover:bg-[#1A1A1A] transition-all duration-300"
        >
          <div className="w-10 h-10 border border-[#E8E4DF] group-hover:border-white/20 flex items-center justify-center mb-5 transition-colors duration-300">
            <Building2 className="h-4 w-4 text-[#6B6560] group-hover:text-white transition-colors duration-300" />
          </div>
          <div className="text-sm font-medium text-[#1A1A1A] group-hover:text-white mb-2 transition-colors duration-300">商案商家</div>
          <div className="text-xs text-[#6B6560] group-hover:text-white/50 leading-relaxed transition-colors duration-300">
            刊登商案並觸及精準買家
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-[#6B6560] group-hover:text-white/60 transition-colors duration-300">
            立即加入
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </motion.button>
      </div>

      <motion.p custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mt-8 text-xs text-[#6B6560] text-center">
        已有帳號？{' '}
        <Link href="/login" className="text-[#1A1A1A] underline underline-offset-4 hover:text-[#B5886C] transition-colors">
          登入
        </Link>
      </motion.p>
    </motion.div>
  )
}

// ── Step 2 — KOL info form ─────────────────────────────────────────────────
function KolForm({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: (data: { name: string; email: string; password: string }) => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [follower, setFollower] = useState('')
  const [contentType, setContentType] = useState('')
  const passwordTooShort = password.length > 0 && password.length < 6

  const togglePlatform = (p: string) =>
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordTooShort) return
    onNext({ name, email, password })
  }

  return (
    <motion.div key="step2-kol" {...slideIn}>
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-[#6B6560] hover:text-[#1A1A1A] transition-colors mb-4">
          <span className="rotate-180 inline-block">→</span> 返回
        </button>
        <h2 className="text-3xl font-serif text-[#1A1A1A] mb-1">建立 KOL 帳號</h2>
        <p className="text-sm text-[#6B6560]">填寫基本資料，完成後進行作品上傳</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name + Email */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-editorial">姓名</label>
            <input
              type="text" required placeholder="陳小安"
              value={name} onChange={(e) => setName(e.target.value)}
              className="input-editorial text-sm"
            />
          </div>
          <div>
            <label className="label-editorial">電子郵件</label>
            <input
              type="email" required placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="input-editorial text-sm"
            />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <label className="label-editorial">密碼</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required minLength={6} placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="input-editorial text-sm pr-8"
            />
            <button
              type="button" onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-0 bottom-4 text-[#6B6560] hover:text-[#1A1A1A] transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordTooShort && (
            <p className="mt-2 text-xs text-red-500">密碼至少需要 6 個字元</p>
          )}
        </motion.div>

        {/* Platforms */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
          <label className="label-editorial">主要平台（可多選）</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {PLATFORMS.map((p) => (
              <button
                key={p} type="button"
                onClick={() => togglePlatform(p)}
                className={`px-3 py-1.5 text-xs border transition-all duration-200 ${
                  platforms.includes(p)
                    ? 'bg-[#1A1A1A] text-[#FAF9F6] border-[#1A1A1A]'
                    : 'bg-transparent text-[#6B6560] border-[#E8E4DF] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Follower range + Content type */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-editorial">粉絲數量</label>
            <select
              value={follower} onChange={(e) => setFollower(e.target.value)}
              className="input-editorial text-sm appearance-none bg-transparent cursor-pointer"
            >
              <option value="">請選擇</option>
              {FOLLOWER_RANGES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label-editorial">內容類型</label>
            <select
              value={contentType} onChange={(e) => setContentType(e.target.value)}
              className="input-editorial text-sm appearance-none bg-transparent cursor-pointer"
            >
              <option value="">請選擇</option>
              {CONTENT_TYPES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Next */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="pt-2">
          <button
            type="submit"
            disabled={passwordTooShort}
            className="group w-full flex items-center justify-between px-6 py-4 bg-[#1A1A1A] text-[#FAF9F6] text-sm uppercase tracking-widest hover:bg-[#2A2A2A] disabled:opacity-50 transition-colors duration-300"
          >
            <span>下一步</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </form>
    </motion.div>
  )
}

// ── Step 3 — KOL media upload ──────────────────────────────────────────────
function KolMediaStep({
  onBack,
  onSubmit,
  error,
  submitting,
}: {
  onBack: () => void
  onSubmit: () => void
  error: string
  submitting: boolean
}) {
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([])
  const [videos, setVideos] = useState<File[]>([])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setPhotos((prev) => {
      const combined = [
        ...prev,
        ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) })),
      ]
      return combined.slice(0, 6)
    })
    e.target.value = ''
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setVideos((prev) => [...prev, ...files].slice(0, 3))
    e.target.value = ''
  }

  const removePhoto = (i: number) =>
    setPhotos((prev) => prev.filter((_, idx) => idx !== i))

  const removeVideo = (i: number) =>
    setVideos((prev) => prev.filter((_, idx) => idx !== i))

  const photoSlots = 6
  const videoSlots = 3

  return (
    <motion.div key="step3-kol" {...slideIn}>
      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-[#6B6560] hover:text-[#1A1A1A] transition-colors mb-4">
          <span className="rotate-180 inline-block">→</span> 返回
        </button>
        <h2 className="text-3xl font-serif text-[#1A1A1A] mb-1">上傳作品集</h2>
        <p className="text-sm text-[#6B6560]">讓商家更了解你的內容風格與質感</p>
      </motion.div>

      {/* Recommendation notice */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex gap-3 p-4 bg-[#FFF8EE] border border-[#F0D9A8] mb-6">
          <Sparkles className="h-4 w-4 text-[#B07D2E] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-[#7A5520] uppercase tracking-widest mb-1">強烈建議上傳</p>
            <p className="text-xs text-[#9A7040] leading-relaxed">
              有作品集的 KOL 獲得商家邀約的機率高出 <span className="font-semibold text-[#7A5520]">3.2 倍</span>。此步驟為選填，但我們強烈建議上傳。
            </p>
          </div>
        </div>
      </motion.div>

      {/* Photos */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <label className="label-editorial flex items-center gap-2">
            <ImagePlus className="h-3.5 w-3.5" />
            個人照片
          </label>
          <span className="text-[0.65rem] text-[#6B6560]">選填 · 最多 6 張</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: photoSlots }).map((_, i) => {
            const photo = photos[i]
            return photo ? (
              <div key={i} className="relative aspect-square group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-[#1A1A1A]/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="aspect-square border border-dashed border-[#D8D4CF] flex flex-col items-center justify-center gap-1.5 text-[#C0BAB3] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            )
          })}
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotoChange}
        />
      </motion.div>

      {/* Videos */}
      <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <label className="label-editorial flex items-center gap-2">
            <Film className="h-3.5 w-3.5" />
            作品影片
          </label>
          <span className="text-[0.65rem] text-[#6B6560]">選填 · 最多 3 部</span>
        </div>

        <div className="space-y-2">
          {Array.from({ length: videoSlots }).map((_, i) => {
            const video = videos[i]
            return video ? (
              <div key={i} className="flex items-center justify-between px-4 py-3 border border-[#E8E4DF] bg-[#FAF9F6]">
                <div className="flex items-center gap-3 min-w-0">
                  <Film className="h-4 w-4 text-[#6B6560] shrink-0" />
                  <p className="text-xs text-[#1A1A1A] truncate">{video.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeVideo(i)}
                  className="text-[#6B6560] hover:text-[#1A1A1A] transition-colors ml-3 shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-3 border border-dashed border-[#D8D4CF] text-[#C0BAB3] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors duration-200"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="text-xs uppercase tracking-widest">上傳影片</span>
              </button>
            )
          })}
        </div>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleVideoChange}
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

      {/* Submit */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="space-y-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
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
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="w-full text-center text-xs text-[#6B6560] hover:text-[#1A1A1A] transition-colors py-1 underline underline-offset-4"
        >
          略過，直接送出申請
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── Step 2 — Merchant form ─────────────────────────────────────────────────
function MerchantForm({
  onBack,
  onSubmit,
  error,
  submitting,
}: {
  onBack: () => void
  onSubmit: (input: { email: string; password: string }) => void
  error: string
  submitting: boolean
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [city, setCity] = useState('')
  const [projectCount, setProjectCount] = useState('')
  const passwordTooShort = password.length > 0 && password.length < 6

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    onSubmit({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    })
  }

  return (
    <motion.div key="step2-merchant" {...slideIn}>
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-[#6B6560] hover:text-[#1A1A1A] transition-colors mb-4">
          <span className="rotate-180 inline-block">→</span> 返回
        </button>
        <h2 className="text-3xl font-serif text-[#1A1A1A] mb-1">建立商家帳號</h2>
        <p className="text-sm text-[#6B6560]">填寫公司資料，審核通過即可刊登商案</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company + Contact */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-editorial">公司名稱</label>
            <input type="text" required placeholder="遠雄建設" className="input-editorial text-sm" />
          </div>
          <div>
            <label className="label-editorial">聯絡人姓名</label>
            <input type="text" required placeholder="張建廷" className="input-editorial text-sm" />
          </div>
        </motion.div>

        {/* Email + Phone */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-editorial">電子郵件</label>
            <input name="email" type="email" required placeholder="contact@company.tw" className="input-editorial text-sm" />
          </div>
          <div>
            <label className="label-editorial">聯絡電話</label>
            <input type="tel" required placeholder="02-1234-5678" className="input-editorial text-sm" />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
          <label className="label-editorial">密碼</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required minLength={6} placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="input-editorial text-sm pr-8"
            />
            <button
              type="button" onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-0 bottom-4 text-[#6B6560] hover:text-[#1A1A1A] transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordTooShort && (
            <p className="mt-2 text-xs text-red-500">密碼至少需要 6 個字元</p>
          )}
        </motion.div>

        {/* City + Project count */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-editorial">商案所在縣市</label>
            <select
              value={city} onChange={(e) => setCity(e.target.value)}
              className="input-editorial text-sm appearance-none bg-transparent cursor-pointer"
            >
              <option value="">請選擇</option>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label-editorial">預計合作商案數</label>
            <select
              value={projectCount} onChange={(e) => setProjectCount(e.target.value)}
              className="input-editorial text-sm appearance-none bg-transparent cursor-pointer"
            >
              <option value="">請選擇</option>
              {PROJECT_COUNTS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500 -mt-2"
          >
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="pt-2">
          <button
            type="submit"
            disabled={submitting || passwordTooShort}
            className="group w-full flex items-center justify-between px-6 py-4 bg-[#1A1A1A] text-[#FAF9F6] text-sm uppercase tracking-widest hover:bg-[#2A2A2A] transition-colors duration-300"
          >
            <span>{submitting ? '送出中…' : '送出申請'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </form>
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [role, setRole] = useState<Role>(null)
  const [kolData, setKolData] = useState<{ name: string; email: string; password: string } | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const totalSteps = role === 'kol' ? 3 : 2

  const selectRole = (r: Role) => {
    setSubmitError('')
    setRole(r)
    setStep(2)
  }

  const goBack = () => {
    setSubmitError('')
    if (step === 3) {
      setStep(2)
    } else {
      setRole(null)
      setStep(1)
    }
  }

  const handleKolNext = (data: { name: string; email: string; password: string }) => {
    setKolData(data)
    setStep(3)
  }

  const createAccount = async ({ email, password }: { email: string; password: string }) => {
    if (!role) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            signup_role: role,
            full_name: kolData?.name ?? '',
          },
        },
      })

      if (error || !data.user) {
        setSubmitError(error?.message ?? '註冊失敗，請稍後再試。')
        return
      }

      const token = data.session?.access_token
      if (!token) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`)
        return
      }

      const assignRoleResponse = await fetch('/api/auth/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      })

      if (!assignRoleResponse.ok) {
        const payload = await assignRoleResponse.json().catch(() => null) as { error?: string } | null
        setSubmitError(payload?.error ?? '角色設定失敗，請稍後再試。')
        return
      }

      router.push(resolveRoleHomePath(role))
    } catch (caughtError) {
      const message =
        caughtError instanceof Error && caughtError.message
          ? caughtError.message
          : '註冊失敗，請稍後再試。'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleKolMediaSubmit = () => {
    if (kolData) createAccount({ email: kolData.email, password: kolData.password })
  }

  const leftKey = role ?? 'null'
  const content = LEFT_CONTENT[leftKey as keyof typeof LEFT_CONTENT]

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#1A1A1A] flex-col justify-between p-16 relative overflow-hidden">
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, #FAF9F6 0px, #FAF9F6 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #FAF9F6 0px, #FAF9F6 1px, transparent 1px, transparent 60px)',
          }}
        />

        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 relative z-10">
          <span className="text-[#FAF9F6] text-lg font-semibold tracking-tight">HomeKey</span>
          <span className="text-[#6B6560] text-sm tracking-widest">房客</span>
        </Link>

        {/* Dynamic content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10 relative z-10"
          >
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-[#6B6560]">{content.eyebrow}</p>
              <h1 className="text-4xl font-serif text-[#FAF9F6] leading-[1.1] whitespace-pre-line">
                {content.headline}
              </h1>
              <p className="text-sm text-[#6B6560] leading-relaxed max-w-xs">{content.desc}</p>
            </div>

            <div className="grid grid-cols-3 gap-px bg-[#2A2A2A] border border-[#2A2A2A]">
              {content.stats.map((s) => (
                <div key={s.label} className="bg-[#1A1A1A] px-4 py-5">
                  <p className="text-xl font-serif text-[#FAF9F6]">{s.value}</p>
                  <p className="text-[0.65rem] uppercase tracking-widest text-[#6B6560] mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Copyright */}
        <p className="text-xs uppercase tracking-[0.3em] text-[#3A3A3A] relative z-10">
          © {new Date().getFullYear()} HomeKey
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 bg-[#FAF9F6] flex flex-col overflow-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-8">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <span className="text-[#1A1A1A] font-semibold tracking-tight">HomeKey</span>
            <span className="text-[#6B6560] text-sm tracking-widest">房客</span>
          </Link>
          <div className="hidden lg:flex items-center gap-3">
            <StepDots step={step} total={totalSteps} />
            <span className="text-xs text-[#6B6560]">{step} / {totalSteps}</span>
          </div>
          <Link
            href="/"
            aria-label="返回首頁"
            className="flex items-center justify-center w-9 h-9 text-[#6B6560] hover:text-[#1A1A1A] hover:bg-[#E8E4DF] rounded-full transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>

        {/* Step content */}
        <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-20 py-12">
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              {step === 1 && <RoleStep onSelect={selectRole} />}
              {step === 2 && role === 'kol' && (
                <KolForm onBack={goBack} onNext={handleKolNext} />
              )}
              {step === 3 && role === 'kol' && (
                <KolMediaStep
                  onBack={goBack}
                  onSubmit={handleKolMediaSubmit}
                  error={submitError}
                  submitting={submitting}
                />
              )}
              {step === 2 && role === 'merchant' && (
                <MerchantForm onBack={goBack} onSubmit={createAccount} error={submitError} submitting={submitting} />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile step dots */}
        <div className="lg:hidden flex items-center justify-center gap-2 pb-8">
          <StepDots step={step} total={totalSteps} />
          <span className="text-xs text-[#6B6560]">{step} / {totalSteps}</span>
        </div>
      </div>
    </div>
  )
}
