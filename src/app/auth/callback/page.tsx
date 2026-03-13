'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Placeholder: in future, handle Supabase OAuth / magic link callbacks here.
    // For now, simply redirect to login while preserving any useful params.
    const redirectTo = '/login'
    const email = searchParams.get('email')
    if (email) {
      router.replace(`${redirectTo}?email=${encodeURIComponent(email)}`)
    } else {
      router.replace(redirectTo)
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <p className="text-sm text-[#6B6560]">正在為你完成登入流程，請稍候…</p>
    </div>
  )
}

