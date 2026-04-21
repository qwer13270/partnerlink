'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon, MoreVertical } from 'lucide-react'
import Logo from '@/components/Logo'
import { cn } from '@/lib/utils'
import strings from '@/lib/strings'

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
  // Longest matching prefix wins, so /kol/resume/edit beats /kol/resume.
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
  if (!user) {
    return (
      <div className="flex items-center gap-3 px-2">
        <div className="avatar h-8 w-8 animate-pulse" />
        <div className="flex-1 min-w-0">
          <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
          <div className="mt-1.5 h-2 w-24 bg-white/[0.06] rounded animate-pulse" />
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="avatar h-8 w-8 flex items-center justify-center text-[11px] shrink-0 overflow-hidden">
        {user.avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
        ) : (
          getInitials(user.displayName)
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-white/90 truncate">{user.displayName}</div>
        <div className="meta text-[9px] text-white/40 mt-0.5 truncate">
          @{user.username}{user.roleLabel ? ` · ${user.roleLabel}` : ''}
        </div>
      </div>
      <button
        type="button"
        aria-label="帳號選項"
        className="text-white/40 hover:text-white transition-colors"
      >
        <MoreVertical className="h-3.5 w-3.5" strokeWidth={1.6} />
      </button>
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

export default function SidebarDark({ items, translationNamespace, user }: SidebarProps) {
  const isActive = useIsActive(items)
  const labels = getSidebarLabels(translationNamespace)

  return (
    <aside className="hidden lg:flex w-[288px] shrink-0 sticky top-0 h-screen flex-col items-center pb-7 border-r border-white/5 font-body">
      <div className="h-[112px] flex items-center w-[220px] shrink-0">
        <Logo href="/kol/home" size="sm" />
      </div>
      <div className="mt-8">
        <NavList items={items} labels={labels} isActive={isActive} />
      </div>
    </aside>
  )
}

export function MobileSidebarDark({ items, translationNamespace, user }: SidebarProps) {
  const isActive = useIsActive(items)
  const labels = getSidebarLabels(translationNamespace)

  return (
    <nav className="bg-black min-h-full py-6 px-5 font-body flex flex-col gap-6">
      <div className="px-2">
        <Logo href="/kol/home" size="sm" />
      </div>
      <NavList items={items} labels={labels} isActive={isActive} />
    </nav>
  )
}
