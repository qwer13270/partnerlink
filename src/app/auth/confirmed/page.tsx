'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'

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
          <p className="text-xs uppercase tracking-[0.4em] text-[#6B6560]">Email Confirmed</p>
          <h1 className="text-4xl font-serif text-[#FAF9F6] leading-[1.12]">
            信箱已完成驗證
            <br />
            等待審核與開通
          </h1>
          <p className="text-sm text-[#6B6560] leading-relaxed max-w-xs">
            你的登入信箱已成功啟用。我們正在為你準備對應的帳號權限與後台入口，很快就能開始使用 PartnerLink
            的完整功能。
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
              <span className="text-[#1A1A1A]">{safeEmail}</span> 已成功完成驗證。
              若你是 KOL，申請資料將由團隊進行審核；若你是商家帳號，我們會為你啟用後台權限。
            </p>
          </motion.div>

          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="space-y-3">
            <p className="text-xs text-[#6B6560]">
              目前狀態：<span className="text-[#1A1A1A]">等待審核 / 權限同步</span>
            </p>
            <p className="text-xs text-[#8A837B]">
              完成審核後，你可以使用剛剛驗證的信箱登入，系統會自動導向對應的儀表板首頁。
            </p>
          </motion.div>

          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="mt-8">
            <Link
              href={`/login?email=${encodeURIComponent(safeEmail)}`}
              className="group w-full flex items-center justify-between px-6 py-4 bg-[#1A1A1A] text-[#FAF9F6] text-sm uppercase tracking-widest hover:bg-[#2A2A2A] transition-colors duration-300"
            >
              <span>前往登入</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.p
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-5 text-xs text-[#6B6560]"
          >
            若你尚未完成註冊流程，請返回 Onboarding 頁面重新送出資料，或聯繫 PartnerLink 團隊協助處理。
          </motion.p>
        </div>
      </div>
    </div>
  )
}

