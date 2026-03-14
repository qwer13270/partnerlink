'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { resolveRoleHomePath } from '@/lib/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { LEFT_CONTENT } from './_constants'
import type { Role, Step, KolSignupDraft } from './_types'
import { StepDots }     from './_components/StepDots'
import { RoleStep }     from './_components/RoleStep'
import { KolForm }      from './_components/KolForm'
import { KolPlatformAccountsStep } from './_components/KolPlatformAccountsStep'
import { MerchantForm } from './_components/MerchantForm'


export default function OnboardingPage() {
  const router = useRouter()
  const t = useTranslations('signup')
  const [step, setStep] = useState<Step>(1)
  const [role, setRole] = useState<Role>(null)
  const [kolData, setKolData] = useState<KolSignupDraft | null>(null)
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

  const handleKolNext = (data: KolSignupDraft) => {
    setKolData(data)
    setStep(3)
  }

  const createAccount = async ({
    email,
    password,
    platforms,
    platformAccounts,
  }: {
    email: string
    password: string
    platforms?: string[]
    platformAccounts?: Record<string, string>
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
          },
        },
      })

      if (error || !data.user) {
        setSubmitError(error?.message ?? t('errors.signupFailed'))
        return
      }

      if (role === 'merchant') {
        const token = data.session?.access_token
        if (!token) {
          router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`)
          return
        }
        const res = await fetch('/api/auth/assign-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ role }),
        })
        if (!res.ok) {
          const payload = await res.json().catch(() => null) as { error?: string } | null
          setSubmitError(payload?.error ?? t('errors.roleAssignFailed'))
          return
        }
        router.push(resolveRoleHomePath(role))
        return
      }

      if (!kolData) {
        setSubmitError(t('errors.kolDataMissing'))
        return
      }

      const token = data.session?.access_token
      const appRes = await fetch('/api/kol/application/preconfirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: data.user.id,
          email: email.trim(),
          fullName: kolData.name,
          platforms: platforms ?? kolData.platforms,
          platformAccounts: platformAccounts ?? {},
          followerRange: kolData.followerRange,
          contentType: kolData.contentType,
          bio: kolData.bio,
          photos: [],
          videos: [],
        }),
      })
      if (!appRes.ok) {
        const payload = await appRes.json().catch(() => null) as { error?: string } | null
        setSubmitError(payload?.error ?? t('errors.kolApplicationFailed'))
        return
      }

      if (token) {
        const completeRes = await fetch('/api/auth/complete-kol-signup', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!completeRes.ok) {
          const payload = await completeRes.json().catch(() => null) as { error?: string } | null
          setSubmitError(payload?.error ?? t('errors.signupFailed'))
          return
        }
        router.push('/pending-approval')
        return
      }

      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`)
    } catch (caughtError) {
      setSubmitError(
        caughtError instanceof Error && caughtError.message ? caughtError.message : t('errors.signupFailed'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleKolPlatformAccountsSubmit = ({ platforms, platformAccounts }: { platforms: string[]; platformAccounts: Record<string, string> }) => {
    if (kolData) {
      createAccount({
        email: kolData.email,
        password: kolData.password,
        platforms,
        platformAccounts,
      })
    }
  }

  const content = LEFT_CONTENT[(role ?? 'null') as keyof typeof LEFT_CONTENT]
  const brandName = t('brand.name')
  const brandTagline = t('brand.tagline')

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#1A1A1A] flex-col justify-between p-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, #FAF9F6 0px, #FAF9F6 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #FAF9F6 0px, #FAF9F6 1px, transparent 1px, transparent 60px)',
          }}
        />
        <Link href="/" className="inline-flex items-center gap-3 relative z-10">
          <span className="text-[#FAF9F6] text-lg font-semibold tracking-tight">{brandName}</span>
          <span className="text-[#6B6560] text-sm tracking-widest">{brandTagline}</span>
        </Link>

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
              <h1 className="text-4xl font-serif text-[#FAF9F6] leading-[1.1] whitespace-pre-line">{content.headline}</h1>
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

        <p className="text-xs uppercase tracking-[0.3em] text-[#3A3A3A] relative z-10">
          {t('brand.copyright', { year: new Date().getFullYear() })}
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 bg-[#FAF9F6] flex flex-col overflow-auto">
        <div className="flex items-center justify-between px-8 pt-8">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <span className="text-[#1A1A1A] font-semibold tracking-tight">{brandName}</span>
            <span className="text-[#6B6560] text-sm tracking-widest">{brandTagline}</span>
          </Link>
          <div className="hidden lg:flex items-center gap-3">
            <StepDots step={step} total={totalSteps} />
            <span className="text-xs text-[#6B6560]">{step} / {totalSteps}</span>
          </div>
          <Link
            href="/"
            aria-label={t('nav.backToHome')}
            className="flex items-center justify-center w-9 h-9 text-[#6B6560] hover:text-[#1A1A1A] hover:bg-[#E8E4DF] rounded-full transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-20 py-12">
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
                <MerchantForm onBack={goBack} onSubmit={createAccount} error={submitError} submitting={submitting} />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:hidden flex items-center justify-center gap-2 pb-8">
          <StepDots step={step} total={totalSteps} />
          <span className="text-xs text-[#6B6560]">{step} / {totalSteps}</span>
        </div>
      </div>
    </div>
  )
}
