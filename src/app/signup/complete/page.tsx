'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Building2, Mic2, X, Check, Loader2, Store } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from '@/components/Logo'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { getRoleFromUser, resolveRoleHomePath } from '@/lib/auth'
import { PENDING_SIGNUP_ROLE_KEY } from '@/components/auth/GoogleSignInButton'
import { CITIES, FOLLOWER_RANGES, CONTENT_TYPES, PROJECT_COUNTS } from '../_constants'
import type { MerchantType } from '@/lib/merchant-application'
import type { User } from '@supabase/supabase-js'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

const darkLabel = 'block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-2 font-body'
const darkInput = 'w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/60 transition-colors duration-200'

type View = 'loading' | 'role' | 'merchant-type' | 'kol-form' | 'merchant-form'
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error'

export default function SignupCompletePage() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string>('')
  const [merchantType, setMerchantType] = useState<MerchantType | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session
      if (!session) { router.replace('/login'); return }
      const existingRole = getRoleFromUser(session.user)
      if (existingRole) { window.location.href = resolveRoleHomePath(existingRole); return }

      setUser(session.user)
      setAccessToken(session.access_token)

      const hinted = (() => {
        try { return sessionStorage.getItem(PENDING_SIGNUP_ROLE_KEY) ?? '' } catch { return '' }
      })()
      const metaSignupRole = typeof session.user.user_metadata?.signup_role === 'string'
        ? session.user.user_metadata.signup_role
        : ''
      const resolvedRole = (metaSignupRole === 'kol' || metaSignupRole === 'merchant')
        ? metaSignupRole
        : (hinted === 'kol' || hinted === 'merchant' ? hinted : null)

      if (resolvedRole === 'kol') { setView('kol-form'); return }
      if (resolvedRole === 'merchant') { setView('merchant-type'); return }
      setView('role')
    })
  }, [router])

  const selectRole = (r: 'kol' | 'merchant') => {
    setError('')
    if (r === 'merchant') setView('merchant-type')
    else setView('kol-form')
  }

  const selectMerchantType = (t: MerchantType) => {
    setMerchantType(t)
    setView('merchant-form')
  }

  const goBack = () => {
    setError('')
    if (view === 'merchant-form') { setView('merchant-type'); return }
    if (view === 'merchant-type' || view === 'kol-form') { setMerchantType(null); setView('role'); return }
  }

  const ensureSignupRoleMetadata = async (r: 'kol' | 'merchant') => {
    const supabase = getSupabaseBrowserClient()
    if (user?.user_metadata?.signup_role === r) return
    const { error: updateErr } = await supabase.auth.updateUser({ data: { signup_role: r } })
    if (updateErr) throw new Error(updateErr.message)
    // Refresh session so the verifier on preconfirm sees updated metadata immediately.
    const { data } = await supabase.auth.refreshSession()
    if (data.session) {
      setUser(data.session.user)
      setAccessToken(data.session.access_token)
    }
  }

  const clearHint = () => {
    try { sessionStorage.removeItem(PENDING_SIGNUP_ROLE_KEY) } catch {}
  }

  const submitKol = async (input: {
    fullName: string; username: string; followerRange: string; contentType: string; bio: string;
  }) => {
    if (!user) return
    setSubmitting(true); setError('')
    try {
      await ensureSignupRoleMetadata('kol')
      const token = accessToken
      const res = await fetch('/api/kol/application/preconfirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          fullName: input.fullName,
          platforms: [],
          platformAccounts: {},
          followerRange: input.followerRange,
          contentType: input.contentType,
          bio: input.bio,
          photos: [], videos: [],
        }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null) as { error?: string } | null
        setError(payload?.error ?? '送出申請失敗，請稍後再試。')
        return
      }
      // Save username into user_metadata for the public profile lookup.
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.updateUser({ data: { kol_username: input.username, full_name: input.fullName } })

      const completeRes = await fetch('/api/auth/complete-kol-signup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const payload = await completeRes.json().catch(() => null) as { status?: string; error?: string } | null
      if (!completeRes.ok && payload?.status !== 'denied') {
        setError(payload?.error ?? '完成申請失敗，請稍後再試。')
        return
      }
      clearHint()
      if (payload?.status === 'approved') { window.location.href = resolveRoleHomePath('kol'); return }
      router.push('/pending-approval')
    } catch (e) {
      setError(e instanceof Error ? e.message : '送出申請失敗。')
    } finally {
      setSubmitting(false)
    }
  }

  const submitMerchant = async (input: {
    companyName: string; contactName: string; phone: string; city: string; projectCount: string;
  }) => {
    if (!user || !merchantType) return
    setSubmitting(true); setError('')
    try {
      await ensureSignupRoleMetadata('merchant')
      const token = accessToken
      const res = await fetch('/api/merchant/application/preconfirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          companyName: input.companyName,
          contactName: input.contactName,
          phone: input.phone,
          city: input.city,
          projectCount: input.projectCount,
          merchantType,
        }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null) as { error?: string } | null
        setError(payload?.error ?? '送出申請失敗，請稍後再試。')
        return
      }
      const completeRes = await fetch('/api/auth/complete-merchant-signup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const payload = await completeRes.json().catch(() => null) as { status?: string; error?: string } | null
      if (!completeRes.ok && payload?.status !== 'denied') {
        setError(payload?.error ?? '完成申請失敗，請稍後再試。')
        return
      }
      clearHint()
      if (payload?.status === 'approved') { window.location.href = resolveRoleHomePath('merchant'); return }
      router.push('/merchant-pending-approval')
    } catch (e) {
      setError(e instanceof Error ? e.message : '送出申請失敗。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="partnerlink-landing fixed inset-0 z-[100] flex overflow-hidden" style={{ background: '#0b0f1a' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-16 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 20% 55%, rgba(100,150,255,0.14) 0%, transparent 70%)' }}
        />
        <Logo className="relative z-10" />
        <div className="space-y-8 relative z-10">
          <div className="inline-flex items-center liquid-glass rounded-full px-4 py-1.5">
            <span className="text-[10px] tracking-[0.3em] text-white/60 font-body uppercase">完成帳號設定</span>
          </div>
          <h1 className="font-heading italic text-white text-5xl leading-[0.95] tracking-tight whitespace-pre-line">
            幾個步驟{'\n'}完成申請
          </h1>
          <p className="font-body text-sm text-white/60 leading-relaxed max-w-xs">
            你的 Google 帳號已連接成功，再提供一些資訊就能送出申請。
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-body relative z-10">
          © {new Date().getFullYear()} PartnerLink
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-auto relative">
        <div className="flex items-center justify-between px-8 pt-8 relative z-10">
          <Logo className="lg:hidden" size="sm" />
          <div className="hidden lg:block" />
          <Link
            href="/"
            aria-label="返回首頁"
            className="liquid-glass rounded-full flex items-center justify-center w-9 h-9 text-white/60 hover:text-white transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-20 py-12 relative z-10">
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              {view === 'loading' && (
                <motion.p key="loading" className="text-sm text-white/60 font-body">載入中…</motion.p>
              )}

              {view === 'role' && (
                <RoleView key="role" email={user?.email ?? ''} onSelect={selectRole} />
              )}

              {view === 'merchant-type' && (
                <MerchantTypeView key="mt" onBack={goBack} onSelect={selectMerchantType} />
              )}

              {view === 'kol-form' && (
                <KolInlineForm
                  key="kol"
                  onBack={goBack}
                  onSubmit={submitKol}
                  submitting={submitting}
                  error={error}
                />
              )}

              {view === 'merchant-form' && merchantType && (
                <MerchantInlineForm
                  key="merchant"
                  merchantType={merchantType}
                  onBack={goBack}
                  onSubmit={submitMerchant}
                  submitting={submitting}
                  error={error}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoleView({ email, onSelect }: { email: string; onSelect: (r: 'kol' | 'merchant') => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
      <div className="mb-10">
        <h2 className="font-heading italic text-white text-4xl mb-2">你是？</h2>
        <p className="font-body text-sm text-white/60">已以 {email} 登入，請選擇你的合作身份以完成申請。</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('kol')}
          className="group text-left liquid-glass rounded-xl p-6 hover:liquid-glass-strong transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-lg liquid-glass flex items-center justify-center mb-5">
            <Mic2 className="h-4 w-4 text-white/60 group-hover:text-white transition-colors duration-300" />
          </div>
          <div className="text-sm font-medium text-white mb-2 font-body">KOL 創作者</div>
          <div className="text-xs text-white/50 leading-relaxed font-body">推廣商案並賺取透明佣金</div>
          <div className="mt-5 flex items-center gap-2 text-xs text-white/40 group-hover:text-white/70 transition-colors duration-300 font-body">
            立即加入 <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </button>
        <button
          onClick={() => onSelect('merchant')}
          className="group text-left liquid-glass rounded-xl p-6 hover:liquid-glass-strong transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-lg liquid-glass flex items-center justify-center mb-5">
            <Building2 className="h-4 w-4 text-white/60 group-hover:text-white transition-colors duration-300" />
          </div>
          <div className="text-sm font-medium text-white mb-2 font-body">商案商家</div>
          <div className="text-xs text-white/50 leading-relaxed font-body">刊登商案並觸及精準買家</div>
          <div className="mt-5 flex items-center gap-2 text-xs text-white/40 group-hover:text-white/70 transition-colors duration-300 font-body">
            立即加入 <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </button>
      </div>
    </motion.div>
  )
}

function MerchantTypeView({ onBack, onSelect }: { onBack: () => void; onSelect: (t: MerchantType) => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
      <button onClick={onBack} className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors mb-4 font-body">
        <span className="rotate-180 inline-block">→</span> 返回
      </button>
      <h2 className="font-heading italic text-white text-3xl mb-8">選擇商家類型</h2>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => onSelect('property')} className="group text-left liquid-glass rounded-xl p-6 hover:liquid-glass-strong transition-all">
          <Building2 className="h-4 w-4 text-white/60 mb-4" />
          <div className="text-sm font-medium text-white mb-1 font-body">建案</div>
          <div className="text-xs text-white/50 font-body">推廣不動產專案</div>
        </button>
        <button onClick={() => onSelect('shop')} className="group text-left liquid-glass rounded-xl p-6 hover:liquid-glass-strong transition-all">
          <Store className="h-4 w-4 text-white/60 mb-4" />
          <div className="text-sm font-medium text-white mb-1 font-body">商案</div>
          <div className="text-xs text-white/50 font-body">推廣店家商品或服務</div>
        </button>
      </div>
    </motion.div>
  )
}

function KolInlineForm({
  onBack, onSubmit, submitting, error,
}: {
  onBack: () => void
  onSubmit: (input: { fullName: string; username: string; followerRange: string; contentType: string; bio: string }) => void
  submitting: boolean
  error: string
}) {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameTouched, setUsernameTouched] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')
  const [followerRange, setFollowerRange] = useState('')
  const [contentType, setContentType] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (!USERNAME_RE.test(username)) { setUsernameStatus('idle'); return }
    setUsernameStatus('checking')
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/kol/check-username?username=${encodeURIComponent(username)}`)
        if (!res.ok) { setUsernameStatus('error'); return }
        const json = await res.json() as { available?: boolean }
        setUsernameStatus(json.available ? 'available' : 'taken')
      } catch { setUsernameStatus('error') }
    }, 500)
    return () => clearTimeout(handle)
  }, [username])

  const usernameFormatInvalid = usernameTouched && username.length > 0 && !USERNAME_RE.test(username)
  const canSubmit = useMemo(() => (
    !!fullName.trim() && USERNAME_RE.test(username) && usernameStatus === 'available'
  ), [fullName, username, usernameStatus])

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({ fullName, username, followerRange, contentType, bio })
  }

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
      <button onClick={onBack} className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors mb-4 font-body">
        <span className="rotate-180 inline-block">→</span> 返回
      </button>
      <h2 className="font-heading italic text-white text-3xl mb-1">完成 KOL 申請</h2>
      <p className="font-body text-sm text-white/60 mb-8">只差一點資訊就能送出審核。</p>

      <form onSubmit={handle} className="space-y-6">
        <div>
          <label className={darkLabel}>姓名</label>
          <input type="text" required placeholder="陳小安" value={fullName} onChange={(e) => setFullName(e.target.value)} className={darkInput} />
        </div>

        <div>
          <label className={darkLabel}>用戶名稱</label>
          <div className="relative flex items-center border-b border-white/20 focus-within:border-white/60 transition-colors">
            <span className="shrink-0 select-none text-sm text-white/40 pr-0.5 font-body">@</span>
            <input
              type="text" required placeholder="your_handle"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              onBlur={() => setUsernameTouched(true)}
              maxLength={20}
              className="flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/25"
            />
            <div className="flex shrink-0 items-center pl-2">
              {usernameStatus === 'checking' && <Loader2 className="h-3.5 w-3.5 animate-spin text-white/40" />}
              {usernameStatus === 'available' && <Check className="h-3.5 w-3.5 text-emerald-400" />}
              {usernameStatus === 'taken' && <X className="h-3.5 w-3.5 text-red-400" />}
            </div>
          </div>
          {usernameFormatInvalid ? (
            <p className="mt-1.5 text-xs text-red-400 font-body">3–20 個字元，只能使用英文小寫、數字與底線</p>
          ) : usernameStatus === 'taken' ? (
            <p className="mt-1.5 text-xs text-red-400 font-body">此用戶名稱已被使用</p>
          ) : (
            <p className="mt-1.5 text-xs text-white/40 font-body">3–20 個字元，英文小寫、數字、底線</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={darkLabel}>粉絲數量</label>
            <select value={followerRange} onChange={(e) => setFollowerRange(e.target.value)} className={`${darkInput} appearance-none cursor-pointer`}>
              <option value="" className="bg-[#0a0a0a]">請選擇</option>
              {FOLLOWER_RANGES.map((r) => <option key={r} className="bg-[#0a0a0a]">{r}</option>)}
            </select>
          </div>
          <div>
            <label className={darkLabel}>內容類型</label>
            <select value={contentType} onChange={(e) => setContentType(e.target.value)} className={`${darkInput} appearance-none cursor-pointer`}>
              <option value="" className="bg-[#0a0a0a]">請選擇</option>
              {CONTENT_TYPES.map((c) => <option key={c} className="bg-[#0a0a0a]">{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={darkLabel}>自我介紹（選填）</label>
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className={`${darkInput} resize-none`} />
        </div>

        {error && <p className="text-xs text-red-400 font-body">{error}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="group w-full flex items-center justify-between px-6 py-3.5 bg-white text-black rounded-full text-sm font-body font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
          >
            <span>{submitting ? '送出中…' : '送出申請'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </form>
    </motion.div>
  )
}

function MerchantInlineForm({
  merchantType, onBack, onSubmit, submitting, error,
}: {
  merchantType: MerchantType
  onBack: () => void
  onSubmit: (input: { companyName: string; contactName: string; phone: string; city: string; projectCount: string }) => void
  submitting: boolean
  error: string
}) {
  const [city, setCity] = useState('')
  const [projectCount, setProjectCount] = useState('')

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget as HTMLFormElement)
    onSubmit({
      companyName: String(data.get('companyName') ?? ''),
      contactName: String(data.get('contactName') ?? ''),
      phone: String(data.get('phone') ?? ''),
      city,
      projectCount,
    })
  }

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
      <button onClick={onBack} className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors mb-4 font-body">
        <span className="rotate-180 inline-block">→</span> 返回
      </button>
      <div className="flex items-center gap-3 mb-1">
        <h2 className="font-heading italic text-white text-3xl">完成商家申請</h2>
        <span className="text-[10px] uppercase tracking-wider liquid-glass rounded-full px-2.5 py-1 text-white/60 font-body">
          {merchantType}
        </span>
      </div>
      <p className="font-body text-sm text-white/60 mb-8">填寫公司資料，送出後進入審核。</p>

      <form onSubmit={handle} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={darkLabel}>公司名稱</label>
            <input name="companyName" type="text" required placeholder="遠雄建設" className={darkInput} />
          </div>
          <div>
            <label className={darkLabel}>聯絡人姓名</label>
            <input name="contactName" type="text" required placeholder="張建廷" className={darkInput} />
          </div>
        </div>

        <div>
          <label className={darkLabel}>聯絡電話</label>
          <input name="phone" type="tel" required placeholder="02-1234-5678" className={darkInput} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={darkLabel}>{merchantType}所在縣市</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className={`${darkInput} appearance-none cursor-pointer`}>
              <option value="" className="bg-[#0a0a0a]">請選擇</option>
              {CITIES.map((c) => <option key={c} className="bg-[#0a0a0a]">{c}</option>)}
            </select>
          </div>
          <div>
            <label className={darkLabel}>預計{merchantType === 'property' ? '建案' : '商案'}數</label>
            <select value={projectCount} onChange={(e) => setProjectCount(e.target.value)} className={`${darkInput} appearance-none cursor-pointer`}>
              <option value="" className="bg-[#0a0a0a]">請選擇</option>
              {PROJECT_COUNTS.map((p) => <option key={p} className="bg-[#0a0a0a]">{p}</option>)}
            </select>
          </div>
        </div>

        {error && <p className="text-xs text-red-400 font-body">{error}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="group w-full flex items-center justify-between px-6 py-3.5 bg-white text-black rounded-full text-sm font-body font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
          >
            <span>{submitting ? '送出中…' : '送出申請'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </form>
    </motion.div>
  )
}
