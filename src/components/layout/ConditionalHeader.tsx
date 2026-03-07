'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

const DASHBOARD_PREFIXES = ['/kol', '/merchant', '/admin']

function isDashboard(pathname: string) {
  if (DASHBOARD_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true
  // Hide header on property detail pages (/properties/[slug]) but not the listing page
  if (pathname.startsWith('/properties/')) return true
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
