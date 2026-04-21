'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronDown, Search } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { HeaderBell, HeaderAvatar } from '@/components/layout/Header'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import KolSearchPalette from '@/components/kol/KolSearchPalette'

interface KolTopBarProps {
  user?: User | null
  displayName?: string
  profilePhotoUrl?: string | null
}

export default function KolTopBar({ user, displayName, profilePhotoUrl }: KolTopBarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const name = useMemo(() => {
    if (displayName) return displayName
    const fromMeta = user?.user_metadata?.full_name
    if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta.trim()
    return user?.email?.split('@')[0] ?? 'user'
  }, [displayName, user])

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="flex items-center h-[112px] border-b border-white/5">
      <div className="mx-auto max-w-[1200px] w-full px-6 lg:px-10 flex items-center">
        {/* Search — left-aligned with the dashboard content column */}
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-label="開啟搜尋"
          className="liquid-glass !rounded-full flex items-center gap-3 px-4 py-2.5 w-full max-w-md text-left hover:bg-white/[0.02] transition-colors"
        >
          <Search className="h-3.5 w-3.5 text-white/45" strokeWidth={1.6} />
          <span className="flex-1 text-sm text-white/40">搜尋合作過的商家或商案…</span>
          <span className="meta text-[9px] text-white/35 px-1.5 py-0.5 rounded border border-white/10">
            ⌘K
          </span>
        </button>

        <div className="flex items-center gap-2 ml-auto pl-4">
        {/* Role + dashboard link (mirror of global header cluster) */}
        <Link
          href="/kol/home"
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full text-[12px] text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="meta text-[10px]">KOL</span>
          <span>KOL 後台</span>
          <ChevronDown className="h-3 w-3" strokeWidth={1.6} />
        </Link>

        {/* Bell */}
        <HeaderBell role="kol" />

        {/* Avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 transition-opacity hover:opacity-85"
            aria-label="用戶選單"
          >
            <HeaderAvatar name={name} imageUrl={profilePhotoUrl ?? null} />
            <ChevronDown
              className={`h-3 w-3 text-white/55 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
              strokeWidth={1.6}
            />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="liquid-glass-strong !absolute !right-0 !top-full !mt-3 !w-56 !rounded-2xl !overflow-hidden z-50 text-white"
              >
                <div className="px-4 py-3.5 border-b border-white/10">
                  <p className="text-sm font-body font-medium truncate text-white">{name}</p>
                  <p className="meta text-[10px] text-white/50 mt-1">KOL</p>
                </div>
                <Link
                  href="/kol/resume/edit"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between w-full px-4 py-3 text-[12px] uppercase tracking-[0.18em] text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors font-body"
                >
                  <span>編輯履歷</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-between w-full px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-white/65 hover:text-white hover:bg-white/[0.06] transition-colors font-body"
                >
                  <span>登出</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </div>
      <KolSearchPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  )
}
