import Link from 'next/link'

export default function PendingApprovalPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] px-6 py-20 bg-[#FAF9F6]">
      <section className="mx-auto max-w-2xl border border-[#DDD4C9] bg-white p-8 md:p-10">
        <p className="text-[0.65rem] uppercase tracking-[0.25em] text-[#8A7A65] mb-3">Application Status</p>
        <h1 className="text-3xl font-serif text-[#1E1A15]">申請已送出，等待審核中</h1>
        <p className="text-sm text-[#6E6254] leading-relaxed mt-4">
          我們已收到你的 KOL 申請，管理員將審核你的資料與作品。審核通過後，你即可登入 KOL 儀表板。
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2.5 text-xs uppercase tracking-[0.2em] bg-[#1A1A1A] text-[#FAF9F6] hover:bg-[#2A2A2A] transition-colors"
          >
            返回首頁
          </Link>
        </div>
      </section>
    </main>
  )
}
