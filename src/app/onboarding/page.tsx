'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X, Eye, EyeOff, Building2, Mic2, ImagePlus, Plus } from 'lucide-react'
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
type KolSignupDraft = {
  name: string
  email: string
  password: string
  platforms: string[]
  platformAccounts: Record<string, string>
  followerRange: string
  contentType: string
  bio: string
}
type KolMediaDraft = {
  profilePhoto: File | null
}
type UploadItemStatus = 'pending' | 'uploading' | 'success' | 'error'
type UploadProgressMap = Record<string, { status: UploadItemStatus; progress: number; error?: string }>

function getUploadKey(mediaType: 'image' | 'video', sortOrder: number, file: File) {
  return `${mediaType}-${sortOrder}-${file.name}-${file.size}`
}

async function uploadKolMediaFile({
  token,
  applicationId,
  mediaType,
  sortOrder,
  isProfile,
  file,
  onProgress,
}: {
  token: string
  applicationId: string
  mediaType: 'image' | 'video'
  sortOrder: number
  isProfile: boolean
  file: File
  onProgress: (progress: number) => void
}) {
  const formData = new FormData()
  formData.append('applicationId', applicationId)
  formData.append('mediaType', mediaType)
  formData.append('sortOrder', String(sortOrder))
  formData.append('isProfile', isProfile ? 'true' : 'false')
  formData.append('file', file)

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/kol/media')
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      const progress = Math.min(100, Math.round((event.loaded / event.total) * 100))
      onProgress(progress)
    }

    xhr.onerror = () => reject(new Error('媒體上傳失敗，網路連線中斷。'))
    xhr.onabort = () => reject(new Error('媒體上傳已中止。'))
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve()
        return
      }

      const payload = JSON.parse(xhr.responseText || '{}') as { error?: string }
      reject(new Error(payload.error ?? `媒體上傳失敗（${xhr.status}）`))
    }

    xhr.send(formData)
  })
}

// ── Left panel content by role ─────────────────────────────────────────────
const LEFT_CONTENT = {
  null: {
    eyebrow: '加入 PartnerLink',
    headline: '選擇你的\n合作身份',
    desc: '無論你是內容創作者或商案商家，PartnerLink 都有專屬方案等你加入。',
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
const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'Threads']
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
  onNext: (data: KolSignupDraft) => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [platformAccounts, setPlatformAccounts] = useState<Record<string, string>>({})
  const [follower, setFollower] = useState('')
  const [contentType, setContentType] = useState('')
  const [bio, setBio] = useState('')
  const passwordTooShort = password.length > 0 && password.length < 6

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) => (
      prev.includes(platform)
        ? prev.filter((item) => item !== platform)
        : [...prev, platform]
    ))

    setPlatformAccounts((prev) => {
      if (platform in prev) {
        const next = { ...prev }
        delete next[platform]
        return next
      }
      return {
        ...prev,
        [platform]: '',
      }
    })
  }

  const handlePlatformAccountChange = (platform: string, value: string) => {
    setPlatformAccounts((prev) => ({
      ...prev,
      [platform]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordTooShort) return
    const hasMissingPlatformAccount = platforms.some((platform) => !platformAccounts[platform]?.trim())
    if (hasMissingPlatformAccount) return
    onNext({
      name,
      email,
      password,
      platforms,
      platformAccounts: Object.fromEntries(
        platforms.map((platform) => [platform, platformAccounts[platform]?.trim() ?? '']),
      ),
      followerRange: follower,
      contentType,
      bio,
    })
  }

  return (
    <motion.div key="step2-kol" {...slideIn}>
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-[#6B6560] hover:text-[#1A1A1A] transition-colors mb-4">
          <span className="rotate-180 inline-block">→</span> 返回
        </button>
        <h2 className="text-3xl font-serif text-[#1A1A1A] mb-1">建立 KOL 帳號</h2>
        <p className="text-sm text-[#6B6560]">填寫基本資料，完成後上傳個人頭像送出審核</p>
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
          {platforms.length > 0 && (
            <div className="mt-4 space-y-3">
              {platforms.map((platform) => (
                <div key={platform}>
                  <label className="label-editorial">{platform} 帳號</label>
                  <input
                    type="text"
                    required
                    placeholder={`輸入 ${platform} 的 @handle 或個人頁面連結`}
                    value={platformAccounts[platform] ?? ''}
                    onChange={(e) => handlePlatformAccountChange(platform, e.target.value)}
                    className="input-editorial text-sm"
                  />
                </div>
              ))}
            </div>
          )}
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

        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
          <label className="label-editorial">自我介紹（選填）</label>
          <textarea
            rows={3}
            placeholder="簡短描述你的受眾與內容風格，幫助商家判斷合作匹配度。"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input-editorial text-sm resize-none"
          />
        </motion.div>

        {/* Next */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp} className="pt-2">
          {platforms.some((platform) => !platformAccounts[platform]?.trim()) && (
            <p className="mb-3 text-xs text-red-500">請為每個已選平台填寫帳號或連結。</p>
          )}
          <button
            type="submit"
            disabled={passwordTooShort || platforms.some((platform) => !platformAccounts[platform]?.trim())}
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

// ── Step 3 — KOL profile photo upload ──────────────────────────────────────
function KolMediaStep({
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
      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-[#6B6560] hover:text-[#1A1A1A] transition-colors mb-4">
          <span className="rotate-180 inline-block">→</span> 返回
        </button>
        <h2 className="text-3xl font-serif text-[#1A1A1A] mb-1">上傳個人頭像</h2>
        <p className="text-sm text-[#6B6560]">管理員會用這張照片辨識你的申請，作品照片與影片可在核准後再補上。</p>
      </motion.div>

      {/* Context notice */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="p-4 bg-[#FFF8EE] border border-[#F0D9A8] mb-6">
          <div>
            <p className="text-xs font-medium text-[#7A5520] uppercase tracking-widest mb-1">審核階段</p>
            <p className="text-xs text-[#9A7040] leading-relaxed">
              目前只需要完成基本資料與個人頭像。通過審核後，你可以登入 KOL 後台再補完整作品集。
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profile photo (required) */}
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

      {/* Submit */}
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
  const [kolData, setKolData] = useState<KolSignupDraft | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgressMap>({})

  const totalSteps = role === 'kol' ? 3 : 2

  const selectRole = (r: Role) => {
    setSubmitError('')
    setRole(r)
    setStep(2)
  }

  const goBack = () => {
    setSubmitError('')
    setUploadProgress({})
    if (step === 3) {
      setStep(2)
    } else {
      setRole(null)
      setStep(1)
    }
  }

  const handleKolNext = (data: KolSignupDraft) => {
    setKolData(data)
    setStep(3)
  }

  const createAccount = async (
    { email, password }: { email: string; password: string },
    kolMedia?: KolMediaDraft,
  ) => {
    if (!role) return
    if (role === 'kol' && !kolMedia?.profilePhoto) {
      setSubmitError('請先上傳個人頭像。')
      return
    }

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
      if (role === 'merchant') {
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
        return
      }

      if (!token) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`)
        return
      }

      if (!kolData) {
        setSubmitError('缺少 KOL 申請資料，請返回上一步重試。')
        return
      }

      const applicationResponse = await fetch('/api/kol/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: kolData.name,
          platforms: kolData.platforms,
          platformAccounts: kolData.platformAccounts,
          followerRange: kolData.followerRange,
          contentType: kolData.contentType,
          bio: kolData.bio,
          photos: [],
          videos: [],
        }),
      })

      if (!applicationResponse.ok) {
        const payload = await applicationResponse.json().catch(() => null) as { error?: string } | null
        setSubmitError(payload?.error ?? '送出 KOL 申請失敗，請稍後再試。')
        return
      }

      const applicationPayload = await applicationResponse.json().catch(() => null) as {
        application?: { id?: string }
      } | null
      const applicationId = applicationPayload?.application?.id
      if (!applicationId) {
        setSubmitError('申請建立成功，但缺少申請編號，請聯繫管理員。')
        return
      }

      const filesToUpload = kolMedia?.profilePhoto
        ? [{ file: kolMedia.profilePhoto, mediaType: 'image' as const, sortOrder: 0, isProfile: true, key: `profile-${getUploadKey('image', 0, kolMedia.profilePhoto)}` }]
        : []

      if (filesToUpload.length > 0) {
        const initialMap = filesToUpload.reduce<UploadProgressMap>((acc, item) => {
          acc[item.key] = { status: 'pending', progress: 0 }
          return acc
        }, {})
        setUploadProgress(initialMap)
      }

      for (const item of filesToUpload) {
        setUploadProgress((prev) => ({
          ...prev,
          [item.key]: { status: 'uploading', progress: 0 },
        }))

        try {
          await uploadKolMediaFile({
            token,
            applicationId,
            mediaType: item.mediaType,
            sortOrder: item.sortOrder,
            isProfile: item.isProfile,
            file: item.file,
            onProgress: (progress) => {
              setUploadProgress((prev) => ({
                ...prev,
                [item.key]: { status: 'uploading', progress },
              }))
            },
          })
          setUploadProgress((prev) => ({
            ...prev,
            [item.key]: { status: 'success', progress: 100 },
          }))
        } catch (uploadError) {
          const message = uploadError instanceof Error ? uploadError.message : '媒體上傳失敗，請稍後再試。'
          setUploadProgress((prev) => ({
            ...prev,
            [item.key]: { status: 'error', progress: prev[item.key]?.progress ?? 0, error: message },
          }))
          setSubmitError(`${item.file.name} 上傳失敗：${message}`)
          return
        }
      }

      router.push('/pending-approval')
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

  const handleKolMediaSubmit = (media: KolMediaDraft) => {
    if (kolData) createAccount({ email: kolData.email, password: kolData.password }, media)
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
          <span className="text-[#FAF9F6] text-lg font-semibold tracking-tight">PartnerLink</span>
          <span className="text-[#6B6560] text-sm tracking-widest">夥伴</span>
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
          © {new Date().getFullYear()} PartnerLink
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 bg-[#FAF9F6] flex flex-col overflow-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-8">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <span className="text-[#1A1A1A] font-semibold tracking-tight">PartnerLink</span>
            <span className="text-[#6B6560] text-sm tracking-widest">夥伴</span>
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
                  uploadProgress={uploadProgress}
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
