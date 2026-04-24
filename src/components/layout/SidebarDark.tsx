'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, LucideIcon, MoreVertical } from 'lucide-react'
import Logo from '@/components/Logo'
import { cn } from '@/lib/utils'
import strings from '@/lib/strings'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export interface SidebarItem {
  href: string
  labelKey: string
  icon: LucideIcon
  meta?: string | number
}

export interface SidebarUser {
  displayName: string
  username: string
  avatarUrl?: string | null
  roleLabel?: string
}

interface SidebarProps {
  items: SidebarItem[]
  translationNamespace: string
  user?: SidebarUser
  homeHref?: string
}

function getSidebarLabels(ns: string): Record<string, string> {
  const namespace = strings[ns as keyof typeof strings]
  if (namespace && typeof namespace === 'object' && 'sidebar' in namespace) {
    return namespace.sidebar as Record<string, string>
  }
  return {}
}

function useIsActive(items: SidebarItem[]) {
  const pathname = usePathname()
  const bestMatch = items
    .filter((it) => pathname === it.href || pathname.startsWith(it.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href
  return (href: string) => href === bestMatch
}

function getInitials(name: string): string {
  return name
    .split(/[\s@_-]/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'
}

function UserCard({ user }: { user?: SidebarUser }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3 px-2 w-[220px]">
        <div className="avatar h-8 w-8 animate-pulse" />
        <div className="flex-1 min-w-0">
          <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
          <div className="mt-1.5 h-2 w-24 bg-white/[0.06] rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-[220px]" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-3 px-2 py-2 w-full rounded-lg hover:bg-white/[0.04] transition-colors"
        aria-label="帳號選項"
      >
        <div className="avatar h-8 w-8 flex items-center justify-center text-[11px] shrink-0 overflow-hidden">
          {user.avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
          ) : (
            getInitials(user.displayName)
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[13px] text-white/90 truncate">{user.displayName}</div>
          <div className="meta text-[9px] text-white/40 mt-0.5 truncate">
            @{user.username}{user.roleLabel ? ` · ${user.roleLabel}` : ''}
          </div>
        </div>
        <MoreVertical className="h-3.5 w-3.5 text-white/40 shrink-0" strokeWidth={1.6} />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="liquid-glass-strong !absolute !left-0 !bottom-full !mb-2 !w-full !rounded-2xl !overflow-hidden z-50 text-white"
          >
            <div className="px-4 py-3.5 border-b border-white/10">
              <p className="text-sm font-body font-medium truncate text-white">{user.displayName}</p>
              {user.roleLabel && <p className="meta text-[10px] text-white/50 mt-1">{user.roleLabel}</p>}
            </div>
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
  )
}

function NavList({ items, labels, isActive }: {
  items: SidebarItem[]
  labels: Record<string, string>
  isActive: (href: string) => boolean
}) {
  return (
    <nav className="flex flex-col gap-1 w-[220px]">
      {items.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'nav-item relative flex items-center gap-3.5 px-4 py-3 text-[15px]',
              active && 'active'
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
            <span className="font-medium tracking-wide">
              {labels[item.labelKey] ?? item.labelKey}
            </span>
            {item.meta !== undefined && (
              <span className="ml-auto meta text-[9px] text-white/50">{item.meta}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export default function SidebarDark({ items, translationNamespace, user, homeHref = '/kol/home' }: SidebarProps) {
  const isActive = useIsActive(items)
  const labels = getSidebarLabels(translationNamespace)

  return (
    <aside className="hidden lg:flex w-[288px] shrink-0 sticky top-0 h-screen flex-col items-center pb-7 border-r border-white/5 font-body">
      <div className="h-[112px] flex items-center w-[220px] shrink-0">
        <Logo href={homeHref} size="sm" />
      </div>
      <div className="mt-8 flex-1">
        <NavList items={items} labels={labels} isActive={isActive} />
      </div>
      <div className="mt-6 pt-6 border-t border-white/5 w-[220px] flex justify-center">
        <UserCard user={user} />
      </div>
    </aside>
  )
}

export function MobileSidebarDark({ items, translationNamespace, user, homeHref = '/kol/home' }: SidebarProps) {
  const isActive = useIsActive(items)
  const labels = getSidebarLabels(translationNamespace)

  return (
    <nav className="bg-black min-h-full py-6 px-5 font-body flex flex-col gap-6">
      <div className="px-2">
        <Logo href={homeHref} size="sm" />
      </div>
      <NavList items={items} labels={labels} isActive={isActive} />
      <div className="mt-auto pt-6 border-t border-white/5">
        <UserCard user={user} />
      </div>
    </nav>
  )
}
