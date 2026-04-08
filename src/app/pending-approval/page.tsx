'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock3, Mail, RefreshCw, ShieldAlert } from 'lucide-react'

type ApplicationStatusPayload = {
  status?: 'approved' | 'pending_admin_review' | 'denied' | 'pending_email_confirmation' | 'missing'
  application?: {
    id?: string
    email?: string
    fullName?: string
    submittedAt?: string
    reviewedAt?: string
    rejectionReason?: string | null
  } | null
  error?: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function formatDate(value?: string) {
  if (!value) return '—'
  return value.slice(0, 10)
}

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-foreground/[0.08] bg-stone-50 px-4 py-3 shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  )
}

export default function PendingApprovalPage() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<ApplicationStatusPayload['status']>('pending_admin_review')
  const [application, setApplication] = useState<ApplicationStatusPayload['application']>(null)
  const [error, setError] = useState('')

  const loadStatus = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/kol/application/status', { cache: 'no-store' })
      const payload = (await response.json().catch(() => null)) as ApplicationStatusPayload | null
      if (!response.ok) {
        setError(payload?.error ?? '讀取申請狀態失敗。')
        setStatus('missing')
        return
      }
      setStatus(payload?.status ?? 'missing')
      setApplication(payload?.application ?? null)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '讀取申請狀態失敗。')
      setStatus('missing')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadStatus()
  }, [])

  const heroCopy = status === 'denied'
    ? {
        eyebrow: 'Review Result',
        title: '目前尚未通過審核',
        body: '你的帳號已完成驗證，但這次 KOL 申請尚未通過。我們建議你聯繫團隊確認原因，再決定是否補件重新申請。',
        icon: ShieldAlert,
        iconClass: 'text-red-600',
        badge: 'Denied',
        badgeClass: 'bg-red-50 text-red-600 border border-red-200/60',
        nextStep: '如果你想重新申請，建議先與團隊確認補件方向，再使用同一個帳號重新整理申請內容。',
      }
    : status === 'missing'
      ? {
          eyebrow: 'Application Check',
          title: '找不到對應的 KOL 申請',
          body: '你的帳號已登入成功，但目前查不到對應的申請資料。這通常表示申請資料尚未建立完成，請聯繫團隊協助處理。',
          icon: ShieldAlert,
          iconClass: 'text-amber-600',
          badge: 'Support Needed',
          badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200/60',
          nextStep: '請聯繫團隊協助補建申請資料，之後你就能回到正常審核流程。',
        }
      : {
          eyebrow: 'Application Status',
          title: 'Email 已驗證，等待管理員審核',
          body: '你已經成功登入，我們也收到了你的 KOL 申請。現在只差管理員完成最後審核，通過後你就能直接進入完整儀表板。',
          icon: Clock3,
          iconClass: 'text-[#8B634D]',
          badge: 'Pending Review',
          badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200/60',
          nextStep: '目前不需要再做其他操作。你可以稍後回來查看，或等待團隊通知。',
        }

  const HeroIcon = heroCopy.icon

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f2eb_0%,#fbfaf8_45%,#f4ede3_100%)] px-6 py-16 md:px-10">
      <section className="mx-auto max-w-5xl space-y-6">

        {/* Hero card */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="rounded-xl border border-foreground/[0.08] bg-[linear-gradient(135deg,#fbf1e5_0%,#f8f4ee_42%,#efe1cf_100%)] shadow-sm overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.22] pointer-events-none rounded-xl"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, rgba(165,114,87,0.09) 1px, transparent 1px), linear-gradient(0deg, rgba(33,58,53,0.05) 1px, transparent 1px)',
                backgroundSize: '34px 34px',
              }}
            />
            <div className="relative grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              {/* Left: main status */}
              <div className="p-8 md:p-10 space-y-5">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 ${heroCopy.iconClass}`}>
                    <HeroIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{heroCopy.eyebrow}</p>
                    <span className={`mt-1 inline-flex items-center gap-1.5 rounded text-[0.72rem] font-medium px-2 py-0.5 ${heroCopy.badgeClass}`}>
                      {status === 'pending_admin_review' && <CheckCircle2 className="h-3 w-3" />}
                      {heroCopy.badge}
                    </span>
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl font-serif font-light leading-[1.1] text-[#1e1914] md:text-[2.2rem]">
                    {heroCopy.title}
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#746558]">
                    {heroCopy.body}
                  </p>
                </div>

                {application?.fullName && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white/60 px-3 py-1.5">
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Applicant</span>
                    <span className="text-sm font-medium text-foreground">{application.fullName}</span>
                  </div>
                )}
              </div>

              {/* Right: status board */}
              <div className="border-t border-foreground/[0.08] lg:border-t-0 lg:border-l bg-white/50 backdrop-blur-[2px] p-6 md:p-7 space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Status Board</p>

                <DataCell label="登入信箱" value={application?.email ?? '—'} />

                <div className="grid grid-cols-2 gap-3">
                  <DataCell label="送件日期" value={formatDate(application?.submittedAt)} />
                  <DataCell label="審核日期" value={formatDate(application?.reviewedAt)} />
                </div>

                <div className="rounded-xl border border-foreground/[0.08] bg-stone-50 px-4 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">下一步</p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/70">{heroCopy.nextStep}</p>
                </div>

                {status === 'denied' && application?.rejectionReason && (
                  <div className="rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-red-600/70">未通過原因</p>
                    <p className="mt-1 text-sm leading-relaxed text-red-700">{application.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
            <div className="rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm">
              {error}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void loadStatus()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground text-background font-medium text-[0.78rem] px-4 py-2.5 hover:bg-foreground/88 active:scale-[0.97] transition-all duration-150 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '讀取中…' : '重新整理狀態'}
          </button>

          <a
            href="mailto:support@partnerlink.tw?subject=KOL%20application%20status"
            className="inline-flex items-center gap-2 rounded-lg bg-black/[0.06] text-foreground/70 font-medium text-[0.78rem] px-4 py-2.5 hover:bg-black/[0.10] active:scale-[0.97] transition-all duration-150"
          >
            <Mail className="h-3.5 w-3.5" />
            聯繫團隊
          </a>
        </motion.div>

      </section>
    </main>
  )
}
