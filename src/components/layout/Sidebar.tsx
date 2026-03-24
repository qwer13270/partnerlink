'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import strings from '@/lib/strings'

export interface SidebarItem {
  href: string
  labelKey: string
  icon: LucideIcon
}

interface SidebarProps {
  items: SidebarItem[]
  translationNamespace: string
}

function getSidebarLabels(ns: string): Record<string, string> {
  const namespace = strings[ns as keyof typeof strings]
  if (namespace && typeof namespace === 'object' && 'sidebar' in namespace) {
    return namespace.sidebar as Record<string, string>
  }
  return {}
}

export default function Sidebar({ items, translationNamespace }: SidebarProps) {
  const pathname = usePathname()
  const labels = getSidebarLabels(translationNamespace)

  const isActive = (href: string) => {
    if (href.split('/').length <= 2) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden lg:block w-72 min-h-screen border-r border-border bg-background">
      <nav className="sticky top-16 py-8 px-6">
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'sidebar-link',
                  active && 'sidebar-link-active'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors duration-200',
                    active ? 'text-foreground' : 'text-muted-foreground'
                  )}
                  strokeWidth={1.5}
                />
                <span className="text-sm">{labels[item.labelKey] ?? item.labelKey}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}

// Mobile sidebar component for use within Sheet
export function MobileSidebar({ items, translationNamespace }: SidebarProps) {
  const pathname = usePathname()
  const labels = getSidebarLabels(translationNamespace)

  const isActive = (href: string) => {
    if (href.split('/').length <= 2) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="py-6 px-4">
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-4 py-4 transition-all duration-200',
                active
                  ? 'text-foreground bg-muted border-l-2 border-foreground'
                  : 'text-muted-foreground hover:text-foreground border-l-2 border-transparent'
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm">{labels[item.labelKey] ?? item.labelKey}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
