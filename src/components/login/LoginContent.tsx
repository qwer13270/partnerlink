'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

function IconLINE() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.055 2 11.11c0 2.717 1.3 5.146 3.35 6.838-.143.523-.52 1.895-.596 2.19-.094.363.132.359.277.261.113-.076 1.795-1.192 2.527-1.676.968.172 1.972.262 3.002.262 5.523 0 9.44-3.795 9.44-7.875C20 6.055 17.523 2 12 2z" />
    </svg>
  )
}

function IconGoogle() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export default function LoginContent() {
  const t = useTranslations('login')
  const router = useRouter()
  const { locale, isZhTW } = useLocale()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/${locale}/kol/dashboard`)
  }

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden">

      {/* ── Left panel — dark brand ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1A1A1A] flex-col justify-between p-16 relative overflow-hidden">
        {/* subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, #FAF9F6 0px, #FAF9F6 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #FAF9F6 0px, #FAF9F6 1px, transparent 1px, transparent 60px)',
          }}
        />

        {/* logo */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <Link href={`/${locale}`} className="inline-flex items-center gap-3">
            <span className="text-[#FAF9F6] text-lg font-semibold tracking-tight">HomeKey</span>
            {isZhTW && (
              <span className="text-[#6B6560] text-sm tracking-widest">房客</span>
            )}
          </Link>
        </motion.div>

        {/* brand copy + stats */}
        <div className="space-y-10">
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-[#6B6560]">
              {isZhTW ? '房地產推廣平台' : 'Real Estate Platform'}
            </p>
            <h1
              className="text-5xl font-serif text-[#FAF9F6] leading-[1.1] whitespace-pre-line"
            >
              {isZhTW ? '房地產\n推廣新模式' : 'A New Way\nto Market\nReal Estate'}
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
              { value: '18+',   label: isZhTW ? '合作建案' : 'Projects' },
              { value: '120+',  label: isZhTW ? '合作 KOL' : 'KOLs' },
              { value: '18.4%', label: isZhTW ? '平均轉換率' : 'Conversion' },
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

        {/* mobile logo */}
        <div className="lg:hidden flex items-center justify-between px-8 pt-8">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <span className="text-[#1A1A1A] font-semibold tracking-tight">HomeKey</span>
            {isZhTW && (
              <span className="text-[#6B6560] text-sm tracking-widest">房客</span>
            )}
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

              {/* submit */}
              <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
                <button
                  type="submit"
                  className="group w-full flex items-center justify-between px-6 py-4 bg-[#1A1A1A] text-[#FAF9F6] text-sm uppercase tracking-widest hover:bg-[#2A2A2A] transition-colors duration-300"
                >
                  <span>{t('signIn')}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </motion.div>
            </form>

            {/* divider */}
            <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="my-10 flex items-center gap-4">
              <div className="flex-1 h-px bg-[#E8E4DF]" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#6B6560]">
                {t('orContinueWith')}
              </span>
              <div className="flex-1 h-px bg-[#E8E4DF]" />
            </motion.div>

            {/* SSO buttons */}
            <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-3">

              {/* LINE */}
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 border px-4 py-3.5 text-xs uppercase tracking-[0.2em] transition-all duration-300"
                style={{ borderColor: '#06C755', color: '#06C755', background: 'transparent' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#06C755'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#06C755'
                }}
              >
                <IconLINE />
                <span>LINE</span>
              </button>

              {/* Google */}
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 border px-4 py-3.5 text-xs uppercase tracking-[0.2em] transition-all duration-300"
                style={{ borderColor: '#E8E4DF', color: '#6B6560', background: 'transparent' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#1A1A1A'
                  e.currentTarget.style.color = '#1A1A1A'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#E8E4DF'
                  e.currentTarget.style.color = '#6B6560'
                }}
              >
                <IconGoogle />
                <span>Google</span>
              </button>
            </motion.div>

            {/* footer */}
            <motion.p
              custom={7}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-10 text-xs text-[#6B6560] text-center"
            >
              {t('noAccount')}{' '}
              <Link
                href={`/${locale}/onboarding`}
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
