'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { resolveRoleHomePath } from '@/lib/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { LEFT_CONTENT } from './_constants'
import { getUploadKey, uploadKolMediaFile } from './_upload'
import type { Role, Step, KolSignupDraft, KolMediaDraft, UploadProgressMap } from './_types'
import { StepDots }     from './_components/StepDots'
import { RoleStep }     from './_components/RoleStep'
import { KolForm }      from './_components/KolForm'
import { KolMediaStep } from './_components/KolMediaStep'
import { MerchantForm } from './_components/MerchantForm'

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
        options: { data: { signup_role: role, full_name: kolData?.name ?? '' } },
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
        const res = await fetch('/api/auth/assign-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ role }),
        })
        if (!res.ok) {
          const payload = await res.json().catch(() => null) as { error?: string } | null
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

      const appRes = await fetch('/api/kol/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
      if (!appRes.ok) {
        const payload = await appRes.json().catch(() => null) as { error?: string } | null
        setSubmitError(payload?.error ?? '送出 KOL 申請失敗，請稍後再試。')
        return
      }

      const appPayload = await appRes.json().catch(() => null) as { application?: { id?: string } } | null
      const applicationId = appPayload?.application?.id
      if (!applicationId) {
        setSubmitError('申請建立成功，但缺少申請編號，請聯繫管理員。')
        return
      }

      const filesToUpload = kolMedia?.profilePhoto
        ? [{ file: kolMedia.profilePhoto, mediaType: 'image' as const, sortOrder: 0, isProfile: true, key: `profile-${getUploadKey('image', 0, kolMedia.profilePhoto)}` }]
        : []

      if (filesToUpload.length > 0) {
        setUploadProgress(
          filesToUpload.reduce<UploadProgressMap>((acc, item) => {
            acc[item.key] = { status: 'pending', progress: 0 }
            return acc
          }, {}),
        )
      }

      for (const item of filesToUpload) {
        setUploadProgress((prev) => ({ ...prev, [item.key]: { status: 'uploading', progress: 0 } }))
        try {
          await uploadKolMediaFile({
            token, applicationId,
            mediaType: item.mediaType, sortOrder: item.sortOrder, isProfile: item.isProfile,
            file: item.file,
            onProgress: (progress) => setUploadProgress((prev) => ({ ...prev, [item.key]: { status: 'uploading', progress } })),
          })
          setUploadProgress((prev) => ({ ...prev, [item.key]: { status: 'success', progress: 100 } }))
        } catch (uploadError) {
          const message = uploadError instanceof Error ? uploadError.message : '媒體上傳失敗，請稍後再試。'
          setUploadProgress((prev) => ({ ...prev, [item.key]: { status: 'error', progress: prev[item.key]?.progress ?? 0, error: message } }))
          setSubmitError(`${item.file.name} 上傳失敗：${message}`)
          return
        }
      }

      router.push('/pending-approval')
    } catch (caughtError) {
      setSubmitError(
        caughtError instanceof Error && caughtError.message ? caughtError.message : '註冊失敗，請稍後再試。',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleKolMediaSubmit = (media: KolMediaDraft) => {
    if (kolData) createAccount({ email: kolData.email, password: kolData.password }, media)
  }

  const content = LEFT_CONTENT[(role ?? 'null') as keyof typeof LEFT_CONTENT]

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
          <span className="text-[#FAF9F6] text-lg font-semibold tracking-tight">HomeKey</span>
          <span className="text-[#6B6560] text-sm tracking-widest">房客</span>
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
          © {new Date().getFullYear()} HomeKey
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 bg-[#FAF9F6] flex flex-col overflow-auto">
        <div className="flex items-center justify-between px-8 pt-8">
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

        <div className="lg:hidden flex items-center justify-center gap-2 pb-8">
          <StepDots step={step} total={totalSteps} />
          <span className="text-xs text-[#6B6560]">{step} / {totalSteps}</span>
        </div>
      </div>
    </div>
  )
}
