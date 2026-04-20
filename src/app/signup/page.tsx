'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { strings, interpolate } from '@/lib/strings'
import { X } from 'lucide-react'
import { resolveRoleHomePath } from '@/lib/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { LEFT_CONTENT } from './_constants'
import type { Role, Step, KolSignupDraft, MerchantSignupDraft, MerchantType } from './_types'
import { StepDots }     from './_components/StepDots'
import { RoleStep }     from './_components/RoleStep'
import { KolForm }      from './_components/KolForm'
import { KolPlatformAccountsStep } from './_components/KolPlatformAccountsStep'
import { MerchantForm } from './_components/MerchantForm'
import { MerchantTypeStep } from './_components/MerchantTypeStep'
import Logo from '@/components/Logo'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function OnboardingPage() {
  const router = useRouter()
  const t = strings.signup
  const [step, setStep] = useState<Step>(1)
  const [role, setRole] = useState<Role>(null)
  const [merchantType, setMerchantType] = useState<MerchantType | null>(null)
  const [kolData, setKolData] = useState<KolSignupDraft | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const totalSteps = 3

  const selectRole = (r: Role) => { setSubmitError(''); setRole(r); setStep(2) }

  const goBack = () => {
    setSubmitError('')
    if (step === 3) { setStep(2) } else { setRole(null); setMerchantType(null); setStep(1) }
  }

  const handleMerchantTypeSelect = (type: MerchantType) => { setMerchantType(type); setStep(3) }

  const handleKolNext = (data: KolSignupDraft) => { setKolData(data); setStep(3) }

  const createAccount = async ({
    email, password, platforms, platformAccounts, merchantData,
  }: {
    email: string
    password: string
    platforms?: string[]
    platformAccounts?: Record<string, string>
    merchantData?: MerchantSignupDraft
  }) => {
    if (!role) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/confirm`,
          data: {
            signup_role: role,
            full_name: kolData?.name ?? '',
            kol_username: kolData?.username ?? '',
          },
        },
      })

      if (error || !data.user) {
        setSubmitError(error?.message ?? t.errors.signupFailed)
        return
      }

      if (role === 'merchant') {
        if (!merchantData) { setSubmitError('缺少商家申請資料，請返回上一步重試。'); return }
        const token = data.session?.access_token
        const preconfirmRes = await fetch('/api/merchant/application/preconfirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            userId: data.user.id, email: email.trim(),
            companyName: merchantData.companyName, contactName: merchantData.contactName,
            phone: merchantData.phone, city: merchantData.city,
            projectCount: merchantData.projectCount, merchantType: merchantData.merchantType,
          }),
        })
        if (!preconfirmRes.ok) {
          const payload = await preconfirmRes.json().catch(() => null) as { error?: string } | null
          setSubmitError(payload?.error ?? '送出商家申請失敗，請稍後再試。')
          return
        }
        if (token) {
          const completeRes = await fetch('/api/auth/complete-merchant-signup', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          })
          const payload = await completeRes.json().catch(() => null) as { error?: string; status?: string } | null
          if (!completeRes.ok && payload?.status !== 'denied') {
            setSubmitError(payload?.error ?? t.errors.signupFailed)
            return
          }
          if (payload?.status === 'approved') { router.push(resolveRoleHomePath(role)); return }
          router.push('/merchant-pending-approval')
          return
        }
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}&notice=complete-merchant-application`)
        return
      }

      if (!kolData) { setSubmitError(t.errors.kolDataMissing); return }
      const token = data.session?.access_token
      const appRes = await fetch('/api/kol/application/preconfirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          userId: data.user.id, email: email.trim(), fullName: kolData.name,
          platforms: platforms ?? kolData.platforms, platformAccounts: platformAccounts ?? {},
          followerRange: kolData.followerRange, contentType: kolData.contentType,
          bio: kolData.bio, photos: [], videos: [],
        }),
      })
      if (!appRes.ok) {
        const payload = await appRes.json().catch(() => null) as { error?: string } | null
        setSubmitError(payload?.error ?? t.errors.kolApplicationFailed)
        return
      }
      if (token) {
        const completeRes = await fetch('/api/auth/complete-kol-signup', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!completeRes.ok) {
          const payload = await completeRes.json().catch(() => null) as { error?: string } | null
          setSubmitError(payload?.error ?? t.errors.signupFailed)
          return
        }
        router.push('/pending-approval')
        return
      }
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`)
    } catch (caughtError) {
      setSubmitError(caughtError instanceof Error && caughtError.message ? caughtError.message : t.errors.signupFailed)
    } finally {
      setSubmitting(false)
    }
  }

  const handleMerchantSubmit = (data: MerchantSignupDraft) => {
    createAccount({ email: data.email, password: data.password, merchantData: data })
  }

  const handleKolPlatformAccountsSubmit = ({ platforms, platformAccounts }: { platforms: string[]; platformAccounts: Record<string, string> }) => {
    if (kolData) createAccount({ email: kolData.email, password: kolData.password, platforms, platformAccounts })
  }

  const content = LEFT_CONTENT[(role ?? 'null') as keyof typeof LEFT_CONTENT]

  return (
    <div className="partnerlink-landing fixed inset-0 z-[100] flex overflow-hidden" style={{ background: '#0b0f1a' }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-16 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 20% 55%, rgba(100,150,255,0.14) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(200,220,255,0.8) 0px, rgba(200,220,255,0.8) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, rgba(200,220,255,0.8) 0px, rgba(200,220,255,0.8) 1px, transparent 1px, transparent 60px)' }}
        />

        <Logo className="relative z-10" />

        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8 relative z-10"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center liquid-glass rounded-full px-4 py-1.5">
                <span className="text-[10px] tracking-[0.3em] text-white/60 font-body uppercase">{content.eyebrow}</span>
              </div>
              <h1 className="font-heading italic text-white text-5xl leading-[0.95] tracking-tight whitespace-pre-line">
                {content.headline}
              </h1>
              <p className="font-body text-sm text-white/60 leading-relaxed max-w-xs">{content.desc}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {content.stats.map((s) => (
                <div key={s.label} className="liquid-glass rounded-xl p-4">
                  <p className="font-heading italic text-white text-xl">{s.value}</p>
                  <p className="font-body text-[10px] uppercase tracking-[0.25em] text-white/50 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-body relative z-10">
          {interpolate(t.brand.copyright, { year: new Date().getFullYear() })}
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col overflow-auto relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(100,150,255,0.05) 0%, transparent 60%)' }}
        />

        <div className="flex items-center justify-between px-8 pt-8 relative z-10">
          <Logo className="lg:hidden" size="sm" />
          <div className="hidden lg:flex items-center gap-3">
            <StepDots step={step} total={totalSteps} />
            <span className="text-xs text-white/40 font-body">{step} / {totalSteps}</span>
          </div>
          <Link
            href="/"
            aria-label={t.nav.backToHome}
            className="liquid-glass rounded-full flex items-center justify-center w-9 h-9 text-white/60 hover:text-white transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-20 py-12 relative z-10">
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              {step === 1 && <RoleStep onSelect={selectRole} />}
              {step === 2 && role === 'kol' && (
                <KolForm onBack={goBack} onNext={handleKolNext} />
              )}
              {step === 3 && role === 'kol' && (
                <KolPlatformAccountsStep
                  initialPlatforms={kolData?.platforms ?? []}
                  onBack={goBack}
                  onSubmit={handleKolPlatformAccountsSubmit}
                  error={submitError}
                  submitting={submitting}
                />
              )}
              {step === 2 && role === 'merchant' && (
                <MerchantTypeStep onBack={goBack} onSelect={handleMerchantTypeSelect} />
              )}
              {step === 3 && role === 'merchant' && merchantType && (
                <MerchantForm
                  onBack={goBack}
                  onSubmit={handleMerchantSubmit}
                  error={submitError}
                  submitting={submitting}
                  merchantType={merchantType}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:hidden flex items-center justify-center gap-2 pb-8 relative z-10">
          <StepDots step={step} total={totalSteps} />
          <span className="text-xs text-white/40 font-body">{step} / {totalSteps}</span>
        </div>
      </div>
    </div>
  )
}
