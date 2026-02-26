'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Menu, X, ChevronDown, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLocale } from '@/hooks/useLocale'
import { DEMO_ROLES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function Header() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const { locale, switchLocale, isZhTW } = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getCurrentRole = () => {
    if (pathname.includes('/kol')) return 'kol'
    if (pathname.includes('/admin')) return 'admin'
    if (pathname.includes('/merchant')) return 'merchant'
    return 'public'
  }

  const currentRole = getCurrentRole()

  const getRoleLabel = (roleId: string) => {
    switch (roleId) {
      case 'public': return t('publicView')
      case 'kol': return t('kolDashboard')
      case 'admin': return t('adminPanel')
      case 'merchant': return t('merchantPortal')
      default: return ''
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="editorial-container">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-3 group">
              <span className="text-lg font-semibold">HomeKey</span>
              {isZhTW && (
                <span className="text-sm text-muted-foreground tracking-widest">
                  房客
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              {/* Role Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="nav-link flex items-center gap-2 pb-0">
                    <span>{getRoleLabel(currentRole)}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  className="w-56 bg-card border-border p-2"
                >
                  {DEMO_ROLES.map((role) => (
                    <DropdownMenuItem key={role.id} asChild>
                      <Link
                        href={`/${locale}${role.href}`}
                        className={cn(
                          'flex items-center justify-between gap-3 px-4 py-3 cursor-pointer transition-all duration-200',
                          currentRole === role.id
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        <span className="text-sm">{getRoleLabel(role.id)}</span>
                        {currentRole === role.id && (
                          <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Language Toggle */}
              <button
                onClick={() => switchLocale(isZhTW ? 'en' : 'zh-TW')}
                className="nav-link pb-0"
              >
                {isZhTW ? 'EN' : '中文'}
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -mr-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-background border-l border-border md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Close Button */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <span className="text-xl font-serif">Menu</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 -mr-2"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 py-8 px-6 space-y-2">
                  {DEMO_ROLES.map((role, index) => (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Link
                        href={`/${locale}${role.href}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center justify-between py-4 border-b border-border transition-colors duration-200',
                          currentRole === role.id
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <span className="text-lg">{getRoleLabel(role.id)}</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Language Toggle */}
                <div className="p-6 border-t border-border">
                  <button
                    onClick={() => {
                      switchLocale(isZhTW ? 'en' : 'zh-TW')
                      setMobileMenuOpen(false)
                    }}
                    className="w-full py-4 text-center text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isZhTW ? 'Switch to English' : '切換至中文'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  )
}
