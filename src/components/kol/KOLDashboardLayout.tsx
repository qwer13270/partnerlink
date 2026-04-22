'use client'

import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Menu, Home, Layers, Mail, FileEdit, ExternalLink } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import SidebarDark, { MobileSidebarDark, type SidebarUser } from '@/components/layout/SidebarDark'
import KolTopBar from '@/components/kol/KolTopBar'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'


interface KOLDashboardLayoutProps {
  children: ReactNode
}

export default function KOLDashboardLayout({ children }: KOLDashboardLayoutProps) {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_e, session) => setUser(session?.user ?? null),
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    fetch('/api/account/profile-photo', { signal: controller.signal })
      .then(async (res) => {
        const payload = (await res.json().catch(() => null)) as
          | { profilePhotoUrl?: string | null }
          | null
        setProfilePhotoUrl(res.ok && typeof payload?.profilePhotoUrl === 'string'
          ? payload.profilePhotoUrl
          : null)
      })
      .catch(() => {
        if (!controller.signal.aborted) setProfilePhotoUrl(null)
      })
    return () => controller.abort()
  }, [user])

  useEffect(() => {
    const handler = (e: Event) => {
      const url = (e as CustomEvent<{ url: string | null }>).detail?.url ?? null
      setProfilePhotoUrl(url)
    }
    window.addEventListener('profile-photo-updated', handler)
    return () => window.removeEventListener('profile-photo-updated', handler)
  }, [])

  const displayName = useMemo(() => {
    if (!user) return ''
    const fromMeta = user.user_metadata?.full_name
    if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta.trim()
    return user.email?.split('@')[0] ?? 'user'
  }, [user])

  const username = useMemo(() => {
    if (!user) return ''
    const meta = user.user_metadata?.username
    if (typeof meta === 'string' && meta.trim()) return meta.trim()
    return user.email?.split('@')[0] ?? ''
  }, [user])

  // Public profile slug lives on user_metadata.kol_username (see
  // src/app/kols/[username]/page.tsx → deriveUsername). Falls back to a
  // sanitized email prefix when unset.
  const kolUsername = useMemo(() => {
    if (!user) return ''
    const stored = user.user_metadata?.kol_username
    if (typeof stored === 'string' && stored.trim()) return stored.trim()
    return (user.email ?? '').split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase()
  }, [user])

  const sidebarUser: SidebarUser | undefined = user
    ? { displayName, username, avatarUrl: profilePhotoUrl, roleLabel: 'KOL' }
    : undefined

  const sidebarItems = useMemo(() => [
    { href: '/kol/home',                             labelKey: 'home',       icon: Home         },
    { href: '/kol/projects',                         labelKey: 'projects',   icon: Layers       },
    { href: '/kol/inbox',                            labelKey: 'inbox',      icon: Mail         },
    { href: '/kol/resume/edit',                      labelKey: 'editResume', icon: FileEdit     },
    { href: kolUsername ? `/kols/${kolUsername}` : '/kol/resume', labelKey: 'viewResume', icon: ExternalLink },
  ], [kolUsername])

  return (
    <div className="partnerlink-landing relative min-h-screen bg-black text-white">
      {/* Force body bg to black so overscroll/rubber-band doesn't reveal the cream app theme */}
      <style jsx global>{`
        html, body { background-color: #000; }
      `}</style>

      <div className="relative z-10 flex min-h-screen max-w-[1488px] mx-auto">
        <SidebarDark items={sidebarItems} translationNamespace="kol" user={sidebarUser} />

        <div className="flex-1 min-w-0 flex flex-col">
          <KolTopBar
            user={user ?? undefined}
            displayName={displayName}
            profilePhotoUrl={profilePhotoUrl}
          />
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
            <MobileSidebarDark items={sidebarItems} translationNamespace="kol" user={sidebarUser} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
