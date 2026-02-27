'use client'

import Link from 'next/link'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="editorial-container">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <span className="text-lg font-semibold">HomeKey</span>
              <span className="text-sm text-muted-foreground tracking-widest">
                房客
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-3">
              {/* Join KOL */}
              <Button asChild variant="outline" size="sm" className="rounded-none text-xs uppercase tracking-widest">
                <Link href="/join/kol">成為 KOL</Link>
              </Button>

              {/* Join Merchant */}
              <Button asChild size="sm" className="rounded-none text-xs uppercase tracking-widest bg-foreground text-background hover:bg-foreground/85">
                <Link href="/join/merchant">成為商家</Link>
              </Button>

              {/* Login */}
              <Button asChild variant="ghost" size="sm" className="rounded-none text-xs uppercase tracking-widest ml-2">
                <Link href="/login">登入</Link>
              </Button>
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
                  {[
                    { label: '成為 KOL', href: '/join/kol' },
                    { label: '成為商家', href: '/join/merchant' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between py-4 border-b border-border text-foreground hover:text-muted-foreground transition-colors duration-200"
                      >
                        <span className="text-lg">{item.label}</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Login */}
                <div className="p-6 border-t border-border">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between w-full py-3 text-sm uppercase tracking-widest text-foreground hover:text-muted-foreground transition-colors"
                  >
                    <span>登入</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
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
