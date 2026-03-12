'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, X } from 'lucide-react'
import { getRoleFromUser, resolveRoleHomePath } from '@/lib/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}


export default function LoginContent() {
  const t = useTranslations('login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const notice = searchParams.get('notice')
  const confirmEmail = searchParams.get('email')
  const prefillEmail = searchParams.get('email') ?? ''
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError('')

    const supabase = getSupabaseBrowserClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError || !data.user) {
      setError(signInError?.message ?? '電子郵件或密碼錯誤，請再試一次。')
      setIsSubmitting(false)
      return
    }

    let role = getRoleFromUser(data.user)
    if (!role && data.session?.access_token) {
      const syncResponse = await fetch('/api/auth/sync-role', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      })

      if (syncResponse.ok) {
        const payload = await syncResponse.json().catch(() => null) as { role?: unknown } | null
        if (payload?.role === 'kol' || payload?.role === 'merchant' || payload?.role === 'admin') {
          role = payload.role
        }
      }
    }

    if (!role) {
      const signupRole = data.user.user_metadata?.signup_role
      if (signupRole === 'kol') {
        await supabase.auth.signOut()
        setError('KOL 帳號審核中，通過後即可登入儀表板。')
        setIsSubmitting(false)
        return
      }

      await supabase.auth.signOut()
      setError('帳號尚未指派角色，請聯繫管理員。')
      setIsSubmitting(false)
      return
    }

    const nextPath = searchParams.get('next')
    if (nextPath && nextPath.startsWith('/')) {
      router.push(nextPath)
      return
    }

    router.push(resolveRoleHomePath(role))
  }

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden">

      {/* ── Left panel — dark brand ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1A1A1A] flex-col justify-between p-16 relative overflow-hidden">
        {/* subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, #FAF9F6 0px, #FAF9F6 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #FAF9F6 0px, #FAF9F6 1px, transparent 1px, transparent 60px)',
          }}
        />

        {/* logo */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="text-[#FAF9F6] text-lg font-semibold tracking-tight">HomeKey</span>
            <span className="text-[#6B6560] text-sm tracking-widest">房客</span>
          </Link>
        </motion.div>

        {/* brand copy + stats */}
        <div className="space-y-10">
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-[#6B6560]">
              品牌聯盟推廣平台
            </p>
            <h1
              className="text-5xl font-serif text-[#FAF9F6] leading-[1.1] whitespace-pre-line"
            >
              {'品牌推廣\n新模式'}
            </h1>
          </motion.div>

          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="grid grid-cols-3 gap-px bg-[#2A2A2A] border border-[#2A2A2A]"
          >
            {[
              { value: '18+',   label: '合作商案' },
              { value: '120+',  label: '合作 KOL' },
              { value: '18.4%', label: '平均轉換率' },
            ].map((s) => (
              <div key={s.label} className="bg-[#1A1A1A] px-5 py-6">
                <p className="text-2xl font-serif text-[#FAF9F6]">{s.value}</p>
                <p className="text-xs uppercase tracking-widest text-[#6B6560] mt-2">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* copyright */}
        <motion.p
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-xs uppercase tracking-[0.3em] text-[#3A3A3A]"
        >
          © {new Date().getFullYear()} HomeKey
        </motion.p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 bg-[#FAF9F6] flex flex-col overflow-auto">

        {/* top bar — logo (mobile) + close button */}
        <div className="flex items-center justify-between px-8 pt-8">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <span className="text-[#1A1A1A] font-semibold tracking-tight">HomeKey</span>
            <span className="text-[#6B6560] text-sm tracking-widest">房客</span>
          </Link>
          <div className="hidden lg:block" />
          <Link
            href="/"
            aria-label="返回首頁"
            className="flex items-center justify-center w-9 h-9 text-[#6B6560] hover:text-[#1A1A1A] hover:bg-[#E8E4DF] rounded-full transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>

        {/* form content */}
        <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-20 py-16">
          <div className="w-full max-w-sm">

            {/* heading */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="mb-12">
              <h2 className="text-3xl font-serif text-[#1A1A1A]">{t('title')}</h2>
              <p className="text-sm text-[#6B6560] mt-2">{t('subtitle')}</p>
            </motion.div>

            {notice === 'confirm-email' && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 text-xs text-[#6B6560]"
              >
                已寄送驗證信到 {confirmEmail ?? '你的信箱'}，請先完成驗證後再登入。
              </motion.p>
            )}

            {/* form */}
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* email */}
              <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                <label className="label-editorial" htmlFor="email">{t('email')}</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-editorial text-sm"
                />
              </motion.div>

              {/* password */}
              <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
                <label className="label-editorial" htmlFor="password">{t('password')}</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-editorial text-sm pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-0 bottom-4 text-[#6B6560] hover:text-[#1A1A1A] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              {/* error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 -mt-2"
                >
                  {error}
                </motion.p>
              )}

              {/* submit */}
              <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative overflow-hidden w-full flex items-center justify-between px-6 py-4 bg-[#1A1A1A] text-[#FAF9F6] text-sm uppercase tracking-widest hover:bg-[#2A2A2A] disabled:opacity-90 transition-colors duration-300"
                >
                  {isSubmitting && (
                    <motion.span
                      initial={{ x: '-120%' }}
                      animate={{ x: '120%' }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                      className="pointer-events-none absolute inset-y-0 w-1/3 bg-white/15 blur-sm"
                    />
                  )}
                  <span>{isSubmitting ? '登入中...' : t('signIn')}</span>
                  <motion.span
                    animate={isSubmitting ? { x: [0, 4, 0] } : { x: 0 }}
                    transition={isSubmitting ? { repeat: Infinity, duration: 0.7, ease: 'easeInOut' } : undefined}
                  >
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.span>
                </button>
              </motion.div>
            </form>

            {/* footer */}
            <motion.p
              custom={5}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-10 text-xs text-[#6B6560] text-center"
            >
              {t('noAccount')}{' '}
              <Link
                href="/onboarding"
                className="text-[#1A1A1A] underline underline-offset-4 hover:text-[#B5886C] transition-colors duration-200"
              >
                {t('getStarted')}
              </Link>
            </motion.p>

          </div>
        </div>
      </div>
    </div>
  )
}
