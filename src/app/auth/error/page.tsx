'use client'

import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-serif text-[#1A1A1A]">登入驗證發生錯誤</h1>
        <p className="text-sm text-[#6B6560]">
          很抱歉，我們在處理你的登入驗證連結時發生問題。請重新嘗試登入，或從登入頁面重新寄送驗證信。
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-5 py-3 mt-2 text-sm uppercase tracking-widest bg-[#1A1A1A] text-[#FAF9F6] hover:bg-[#2A2A2A] transition-colors duration-300"
        >
          回到登入
        </Link>
      </div>
    </div>
  )
}

