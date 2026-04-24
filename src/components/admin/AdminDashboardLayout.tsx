'use client'

import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Menu, LayoutDashboard, UserPlus, Building2, Users, Store } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import SidebarDark, { MobileSidebarDark, type SidebarUser } from '@/components/layout/SidebarDark'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const sidebarItems = [
  { href: '/admin',                        labelKey: 'overview',             icon: LayoutDashboard },
  { href: '/admin/kol-applications',       labelKey: 'kolApplications',      icon: UserPlus        },
  { href: '/admin/merchant-applications',  labelKey: 'merchantApplications', icon: Building2       },
  { href: '/admin/kols',                   labelKey: 'kols',                 icon: Users           },
  { href: '/admin/merchants',              labelKey: 'merchants',            icon: Store           },
]

interface AdminDashboardLayoutProps {
  children: ReactNode
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_e, session) => setUser(session?.user ?? null),
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  const displayName = useMemo(() => {
    if (!user) return ''
    const fromMeta = user.user_metadata?.full_name
    if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta.trim()
    return user.email?.split('@')[0] ?? 'admin'
  }, [user])

  const username = useMemo(() => {
    if (!user) return ''
    const meta = user.user_metadata?.username
    if (typeof meta === 'string' && meta.trim()) return meta.trim()
    return user.email?.split('@')[0] ?? ''
  }, [user])

  const sidebarUser: SidebarUser | undefined = user
    ? { displayName, username, avatarUrl: null, roleLabel: 'ADMIN' }
    : undefined

  return (
    <div className="partnerlink-landing relative min-h-screen bg-black text-white">
      <style jsx global>{`
        html, body { background-color: #000; }
      `}</style>

      <div className="relative z-10 flex min-h-screen">
        <SidebarDark items={sidebarItems} translationNamespace="admin" user={sidebarUser} homeHref="/admin" />

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="mx-auto px-6 lg:px-10 pt-10 lg:pt-12 pb-16 max-w-[1200px] w-full">
            {children}
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className="liquid-glass-strong h-12 w-12 rounded-full text-white flex items-center justify-center"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-black border-white/10 text-white">
            <MobileSidebarDark items={sidebarItems} translationNamespace="admin" user={sidebarUser} homeHref="/admin" />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
