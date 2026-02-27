'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

const DASHBOARD_PREFIXES = ['/kol', '/merchant', '/admin', '/properties']

function isDashboard(pathname: string) {
  return DASHBOARD_PREFIXES.some((prefix) => pathname.startsWith(prefix))
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
