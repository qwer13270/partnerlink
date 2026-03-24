'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Clock3, Mail, RefreshCw, ShieldAlert } from 'lucide-react'

type ApplicationStatusPayload = {
  status?: 'approved' | 'pending_admin_review' | 'denied' | 'pending_email_confirmation' | 'missing'
  application?: {
    id?: string
    email?: string
    companyName?: string
    submittedAt?: string
    reviewedAt?: string
    rejectionReason?: string | null
  } | null
  error?: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function formatDate(value?: string) {
  if (!value) return '—'
  return value.slice(0, 10)
}

export default function MerchantPendingApprovalPage() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<ApplicationStatusPayload['status']>('pending_admin_review')
  const [application, setApplication] = useState<ApplicationStatusPayload['application']>(null)
  const [error, setError] = useState('')

  const loadStatus = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/merchant/application/status', { cache: 'no-store' })
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
        title: '目前尚未通過商家審核',
        body: '你的帳號已完成驗證，但這次商家申請尚未通過。我們建議你聯繫團隊確認原因，再決定是否補件重新申請。',
        icon: ShieldAlert,
        accent: 'text-[#9E4E4E]',
        badge: 'Denied',
        badgeClass: 'border-red-200 bg-red-50 text-red-700',
      }
    : status === 'missing'
      ? {
          eyebrow: 'Application Check',
          title: '找不到對應的商家申請',
          body: '你的帳號已登入成功，但目前查不到對應的商家申請資料。這通常表示申請資料尚未建立完成，請聯繫團隊協助處理。',
          icon: ShieldAlert,
          accent: 'text-[#8A5A44]',
          badge: 'Support Needed',
          badgeClass: 'border-[#d9c4ae] bg-[#fbf2e7] text-[#9a6c53]',
        }
      : {
          eyebrow: 'Application Status',
          title: 'Email 已驗證，等待管理員審核',
          body: '你已經成功登入，我們也收到了你的商家申請。現在只差管理員完成最後審核，通過後你就能進入完整商家後台。',
          icon: Clock3,
          accent: 'text-[#8B634D]',
          badge: 'Pending Review',
          badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
        }

  const HeroIcon = heroCopy.icon

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f2eb_0%,#fbfaf8_45%,#f4ede3_100%)] px-6 py-16 md:px-10">
      <section className="mx-auto max-w-5xl space-y-8">
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative overflow-hidden border border-[#d8c7b4] bg-[linear-gradient(135deg,#fbf1e5_0%,#f8f4ee_42%,#efe1cf_100%)] p-8 md:p-10">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.28] pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, rgba(165,114,87,0.09) 1px, transparent 1px), linear-gradient(0deg, rgba(33,58,53,0.05) 1px, transparent 1px)',
                backgroundSize: '34px 34px',
              }}
            />
            <div className="relative space-y-5">
              <div className="flex items-center gap-3">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/70 ${heroCopy.accent}`}>
                  <HeroIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[#9b7865]">{heroCopy.eyebrow}</p>
                  <span className={`mt-1 inline-flex items-center gap-2 border px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.24em] ${heroCopy.badgeClass}`}>
                    {status === 'pending_admin_review' && <Building2 className="h-3 w-3" />}
                    {heroCopy.badge}
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-serif leading-[1.08] text-[#1e1914] md:text-[2.35rem]">{heroCopy.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#746558]">{heroCopy.body}</p>
              </div>
              {application?.companyName && (
                <div className="inline-flex items-center gap-2 border border-black/10 bg-white/60 px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#7f6a5a]">
                  <span>Merchant</span>
                  <span className="text-[#1e1914]">{application.companyName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border border-[#ded4c8] bg-white/70 p-6 backdrop-blur-[2px] md:p-7">
            <p className="text-[0.62rem] uppercase tracking-[0.3em] text-[#9b8b7e]">Status Board</p>
            <div className="mt-5 space-y-4">
              <div className="border border-black/8 bg-[#faf7f3] p-4">
                <p className="text-[0.58rem] uppercase tracking-[0.24em] text-[#9a8a7e]">登入信箱</p>
                <p className="mt-1 text-sm text-[#1e1914]">{application?.email ?? '—'}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-black/8 bg-[#faf7f3] p-4">
                  <p className="text-[0.58rem] uppercase tracking-[0.24em] text-[#9a8a7e]">送件日期</p>
                  <p className="mt-1 text-sm text-[#1e1914]">{formatDate(application?.submittedAt)}</p>
                </div>
                <div className="border border-black/8 bg-[#faf7f3] p-4">
                  <p className="text-[0.58rem] uppercase tracking-[0.24em] text-[#9a8a7e]">審核日期</p>
                  <p className="mt-1 text-sm text-[#1e1914]">{formatDate(application?.reviewedAt)}</p>
                </div>
              </div>
              <div className="border border-black/8 bg-[#faf7f3] p-4">
                <p className="text-[0.58rem] uppercase tracking-[0.24em] text-[#9a8a7e]">下一步</p>
                <p className="mt-1 text-sm leading-relaxed text-[#5e5146]">
                  {status === 'denied'
                    ? '如果你想重新申請，建議先與團隊確認補件方向，再使用同一個帳號重新整理申請內容。'
                    : status === 'missing'
                      ? '請聯繫團隊協助補建申請資料，之後你就能回到正常審核流程。'
                      : '目前不需要再做其他操作。你可以稍後回來查看，或等待團隊通知。'}
                </p>
              </div>
              {status === 'denied' && application?.rejectionReason && (
                <div className="border border-red-200 bg-red-50 p-4">
                  <p className="text-[0.58rem] uppercase tracking-[0.24em] text-red-700">未通過原因</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#6d3f3f]">{application.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </motion.div>
        )}

        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => void loadStatus()}
            disabled={loading}
            className="group flex items-center justify-between border border-[#d7ccbf] bg-white px-5 py-4 text-xs uppercase tracking-[0.22em] text-[#1e1914] transition-colors duration-200 hover:bg-[#f7f0e8] disabled:opacity-60"
          >
            <span>{loading ? '讀取中…' : '重新整理狀態'}</span>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : 'transition-transform duration-200 group-hover:rotate-12'}`} />
          </button>

          <div className="flex flex-wrap gap-3 md:justify-end">
            <a
              href="mailto:support@partnerlink.tw?subject=Merchant%20application%20status"
              className="inline-flex items-center gap-2 border border-[#d7ccbf] bg-white px-4 py-4 text-xs uppercase tracking-[0.18em] text-[#1e1914] transition-colors duration-200 hover:bg-[#f7f0e8]"
            >
              <Mail className="h-3.5 w-3.5" />
              聯繫團隊
            </a>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
