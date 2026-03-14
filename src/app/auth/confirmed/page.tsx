'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, ShieldCheck, LogIn } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function AuthConfirmedPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const safeEmail = email?.trim() || '你的信箱'

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden bg-[#FAF9F6]">
      {/* Left editorial panel – mirror onboarding aesthetic */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#1A1A1A] flex-col justify-between p-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, #FAF9F6 0px, #FAF9F6 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #FAF9F6 0px, #FAF9F6 1px, transparent 1px, transparent 60px)',
          }}
        />

        <Link href="/" className="inline-flex items-center gap-3 relative z-10">
          <span className="text-[#FAF9F6] text-lg font-semibold tracking-tight">PartnerLink</span>
          <span className="text-[#6B6560] text-sm tracking-widest">夥伴</span>
        </Link>

        <div className="space-y-4 relative z-10">
          <p className="text-xs uppercase tracking-[0.4em] text-[#6B6560]">One Last Step</p>
          <h1 className="text-4xl font-serif text-[#FAF9F6] leading-[1.12]">
            信箱已驗證完成
            <br />
            還差登入這一步
          </h1>
          <p className="text-sm text-[#6B6560] leading-relaxed max-w-xs">
            KOL 申請不會在驗證信箱後自動送出。請使用剛剛完成驗證的帳號登入一次，系統才會正式建立申請並送進審核流程。
          </p>
        </div>

        <p className="text-xs uppercase tracking-[0.3em] text-[#3A3A3A] relative z-10">
          © {new Date().getFullYear()} PartnerLink
        </p>
      </div>

      {/* Right confirmation panel */}
      <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-20 py-12">
        <div className="w-full max-w-md border border-[#E8E4DF] bg-white/70 backdrop-blur-sm p-8 md:p-10">
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
            <div className="w-12 h-12 border border-[#E8E4DF] flex items-center justify-center mb-5 bg-[#FAF9F6]">
              <CheckCircle2 className="h-6 w-6 text-[#1A1A1A]" />
            </div>
            <h2 className="text-3xl font-serif text-[#1A1A1A]">Email 驗證完成</h2>
            <p className="text-sm text-[#6B6560] mt-3 leading-relaxed">
              <span className="text-[#1A1A1A]">{safeEmail}</span> 已成功完成驗證，但 KOL 申請還沒有真正送出。
              請先登入一次，系統才會把你的申請資料送進審核。
            </p>
          </motion.div>

          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6 border border-[#E8E4DF] bg-[#FAF9F6] p-4"
          >
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#8A837B]">重要提醒</p>
            <p className="mt-2 text-sm text-[#1A1A1A] leading-relaxed">
              只有完成登入後，KOL 申請才會正式送出。
            </p>
          </motion.div>

          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="space-y-3">
            {[
              {
                icon: LogIn,
                title: '1. 先登入帳號',
                body: '用剛剛完成驗證的 Email 與密碼登入一次。',
              },
              {
                icon: ShieldCheck,
                title: '2. 系統送出申請',
                body: '登入成功後，系統才會把你的 KOL 申請資料送進審核流程。',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-3 border-t border-[#ECE7E1] pt-3 first:border-t-0 first:pt-0">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-[#E8E4DF] bg-white">
                  <Icon className="h-4 w-4 text-[#1A1A1A]" />
                </div>
                <div>
                  <p className="text-sm text-[#1A1A1A]">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#6B6560]">{body}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mt-8">
            <Link
              href={`/login?email=${encodeURIComponent(safeEmail)}&notice=complete-kol-application`}
              className="group w-full flex items-center justify-between px-6 py-4 bg-[#1A1A1A] text-[#FAF9F6] text-sm uppercase tracking-widest hover:bg-[#2A2A2A] transition-colors duration-300"
            >
              <span>立即登入送出申請</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.p
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-5 text-xs text-[#6B6560]"
          >
            如果你現在先離開也沒關係，但記得回來登入一次；未登入前，申請不會進入審核。
          </motion.p>
        </div>
      </div>
    </div>
  )
}
