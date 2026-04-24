'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

function isDashboard(pathname: string) {
  if (pathname === '/') return true
  if (pathname.startsWith('/properties/')) return true
  if (pathname.startsWith('/shops/')) return true
  if (pathname.startsWith('/kols/')) return true
  if (pathname.startsWith('/kol/')) return true
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return true
  return false
}

export function ConditionalHeader() {
  const pathname = usePathname()
  if (isDashboard(pathname)) return null
  return <Header />
}

export function ConditionalFooter() {
  const pathname = usePathname()
  if (isDashboard(pathname)) return null
  return <Footer />
}
