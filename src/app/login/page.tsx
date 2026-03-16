import { Suspense } from 'react'
import LoginContent from '@/components/login/LoginContent'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
