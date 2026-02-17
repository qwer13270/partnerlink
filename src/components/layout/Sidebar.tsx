'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocale } from '@/hooks/useLocale'

export interface SidebarItem {
  href: string
  labelKey: string
  icon: LucideIcon
}

interface SidebarProps {
  items: SidebarItem[]
  translationNamespace: string
}

export default function Sidebar({ items, translationNamespace }: SidebarProps) {
  const pathname = usePathname()
  const { locale } = useLocale()
  const t = useTranslations(`${translationNamespace}.sidebar`)

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`
    if (href.split('/').length <= 2) {
      return pathname === fullPath
    }
    return pathname.startsWith(fullPath)
  }

  return (
    <aside className="hidden lg:block w-72 min-h-[calc(100vh-5rem)] border-r border-border bg-background">
      <nav className="sticky top-24 py-8 px-6">
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
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
                <span className="text-sm">{t(item.labelKey)}</span>
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
  const { locale } = useLocale()
  const t = useTranslations(`${translationNamespace}.sidebar`)

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`
    if (href.split('/').length <= 2) {
      return pathname === fullPath
    }
    return pathname.startsWith(fullPath)
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
              href={`/${locale}${item.href}`}
              className={cn(
                'flex items-center gap-4 px-4 py-4 transition-all duration-200',
                active
                  ? 'text-foreground bg-muted border-l-2 border-foreground'
                  : 'text-muted-foreground hover:text-foreground border-l-2 border-transparent'
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm">{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
