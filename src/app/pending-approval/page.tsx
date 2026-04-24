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
    <div className="liquid-glass rounded-xl px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/45 font-body">{label}</p>
      <p className="mt-1 text-sm text-white/90 font-body">{value}</p>
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

  useEffect(() => {
    const prevBody = document.body.style.backgroundColor
    const prevHtml = document.documentElement.style.backgroundColor
    document.body.style.backgroundColor = '#000'
    document.documentElement.style.backgroundColor = '#000'
    return () => {
      document.body.style.backgroundColor = prevBody
      document.documentElement.style.backgroundColor = prevHtml
    }
  }, [])

  const heroCopy = status === 'denied'
    ? {
        eyebrow: 'Review Result',
        title: '目前尚未通過審核',
        body: '你的帳號已完成驗證，但這次 KOL 申請尚未通過。我們建議你聯繫團隊確認原因，再決定是否補件重新申請。',
        icon: ShieldAlert,
        iconClass: 'text-[#ff9a9a]',
        badge: 'Denied',
        dotClass: 'bg-red-300/80',
        nextStep: '如果你想重新申請，建議先與團隊確認補件方向，再使用同一個帳號重新整理申請內容。',
      }
    : status === 'missing'
      ? {
          eyebrow: 'Application Check',
          title: '找不到對應的 KOL 申請',
          body: '你的帳號已登入成功，但目前查不到對應的申請資料。這通常表示申請資料尚未建立完成，請聯繫團隊協助處理。',
          icon: ShieldAlert,
          iconClass: 'text-[#ffd28a]',
          badge: 'Support Needed',
          dotClass: 'bg-amber-300/80',
          nextStep: '請聯繫團隊協助補建申請資料，之後你就能回到正常審核流程。',
        }
      : {
          eyebrow: 'Application Status',
          title: 'Email 已驗證，等待管理員審核',
          body: '你已經成功登入，我們也收到了你的 KOL 申請。現在只差管理員完成最後審核，通過後你就能直接進入完整儀表板。',
          icon: Clock3,
          iconClass: 'text-white/85',
          badge: 'Pending Review',
          dotClass: 'bg-sky-300/80',
          nextStep: '目前不需要再做其他操作。你可以稍後回來查看，或等待團隊通知。',
        }

  const HeroIcon = heroCopy.icon
  const isPending = status !== 'denied' && status !== 'missing'

  return (
    <main className="partnerlink-landing relative -mt-16 min-h-screen overflow-hidden bg-black px-6 pt-40 pb-24 md:px-10">
      {/* radial glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(100,150,255,0.10) 0%, transparent 70%)',
        }}
      />
      {/* faint grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 30%, transparent 80%)',
        }}
      />

      <section className="relative mx-auto max-w-5xl space-y-6">

        {/* Hero card */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="liquid-glass rounded-2xl overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              {/* Left: main status */}
              <div className="p-8 md:p-10 space-y-5">
                <div className="flex items-center gap-3">
                  <span className={`liquid-glass-strong inline-flex h-10 w-10 items-center justify-center !rounded-full ${heroCopy.iconClass}`}>
                    <HeroIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/55 font-body">{heroCopy.eyebrow}</p>
                    <span className="liquid-glass mt-1 inline-flex items-center gap-2 !rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-white/75 font-body">
                      <span className="relative inline-flex w-2 h-2 items-center justify-center">
                        {isPending && (
                          <span className={`absolute inset-0 rounded-full ${heroCopy.dotClass} animate-ping opacity-70`} />
                        )}
                        <span className={`relative w-1.5 h-1.5 rounded-full ${heroCopy.dotClass}`} />
                      </span>
                      {isPending && <CheckCircle2 className="h-3 w-3" />}
                      {heroCopy.badge}
                    </span>
                  </div>
                </div>

                <div>
                  <h1 className="font-heading text-white text-3xl leading-[1.1] md:text-[2.4rem]">
                    {heroCopy.title}
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed font-body font-light text-white/65">
                    {heroCopy.body}
                  </p>
                </div>

                {application?.fullName && (
                  <div className="liquid-glass inline-flex items-center gap-2 !rounded-full px-3 py-1.5">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/55 font-body">Applicant</span>
                    <span className="text-sm font-medium text-white/90 font-body">{application.fullName}</span>
                  </div>
                )}
              </div>

              {/* Right: status board */}
              <div className="border-t border-white/10 lg:border-t-0 lg:border-l p-6 md:p-7 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/55 font-body">Status Board</p>

                <DataCell label="登入信箱" value={application?.email ?? '—'} />

                <div className="grid grid-cols-2 gap-3">
                  <DataCell label="送件日期" value={formatDate(application?.submittedAt)} />
                  <DataCell label="審核日期" value={formatDate(application?.reviewedAt)} />
                </div>

                <div className="liquid-glass rounded-xl px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/45 font-body">下一步</p>
                  <p className="mt-1 text-sm leading-relaxed font-body font-light text-white/70">{heroCopy.nextStep}</p>
                </div>

                {status === 'denied' && application?.rejectionReason && (
                  <div className="liquid-glass rounded-xl border border-red-300/20 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-red-300/70 font-body">未通過原因</p>
                    <p className="mt-1 text-sm leading-relaxed font-body text-red-200/90">{application.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
            <div className="liquid-glass rounded-xl border border-red-300/25 px-4 py-3 text-sm text-red-200/90 font-body">
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
            className="inline-flex items-center gap-2 rounded-full bg-white text-black font-body font-medium text-sm px-5 py-2.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-150 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '讀取中…' : '重新整理狀態'}
          </button>

          <a
            href="mailto:support@partnerlink.tw?subject=KOL%20application%20status"
            className="liquid-glass-strong inline-flex items-center gap-2 !rounded-full px-5 py-2.5 text-sm font-body font-medium text-white hover:text-white"
          >
            <Mail className="h-3.5 w-3.5" />
            聯繫團隊
          </a>
        </motion.div>

      </section>
    </main>
  )
}
