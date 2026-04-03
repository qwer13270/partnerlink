'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, Home, LayoutGrid, ArrowLeft,
  Users, Handshake, Pencil, Eye, BrainCircuit, BarChart3,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ── Sub-nav definitions ──────────────────────────────────────────────────────
type NavItem = { seg: string; label: string; Icon: React.ElementType }

const MANAGE: NavItem[] = [
  { seg: 'customers', label: '客戶名單',     Icon: Users        },
  { seg: 'kols',      label: 'KOL 合作',     Icon: Handshake    },
  { seg: 'edit',      label: '商案編輯',     Icon: Pencil       },
  { seg: 'preview',   label: '預覽頁面',     Icon: Eye          },
]

const ANALYSE: NavItem[] = [
  { seg: 'audience',  label: '受眾輪廓分析', Icon: BrainCircuit },
  { seg: 'analytics', label: '地區房市行情', Icon: BarChart3    },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function getProjectId(pathname: string): string | null {
  const m = pathname.match(/^\/merchant\/projects\/([^/]+)/)
  if (!m || m[1] === 'archived') return null
  return m[1]
}

// ── Section label — sits between nav groups ──────────────────────────────────
function SectionLabel({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-6 pt-5 pb-1">
      <span
        className="text-[0.52rem] font-mono uppercase tracking-[0.6em] select-none"
        style={{ color: gold ? 'rgba(196,145,58,0.5)' : 'rgba(26,26,26,0.25)' }}
      >
        {children}
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: gold ? 'rgba(196,145,58,0.12)' : 'rgba(26,26,26,0.07)' }}
      />
    </div>
  )
}

// ── Sidebar content ──────────────────────────────────────────────────────────
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname  = usePathname()
  const projectId = getProjectId(pathname)
  const [projectName, setProjectName] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) { setProjectName(null); return }
    let alive = true
    fetch(`/api/merchant/projects/${projectId}`, { cache: 'no-store' })
      .then(r => r.json())
      .then((d: { project?: { name?: string } }) => {
        if (alive) setProjectName(d.project?.name ?? null)
      })
      .catch(() => {})
    return () => { alive = false }
  }, [projectId])

  return (
    <nav className="sticky top-16 py-8">
      <AnimatePresence mode="wait" initial={false}>

        {/* ── PROJECT MODE ──────────────────────────────────────────────── */}
        {projectId ? (
          <motion.div
            key="project"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Back */}
            <Link
              href="/merchant/projects"
              onClick={onNavigate}
              className="sidebar-link group"
            >
              <ArrowLeft
                className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200"
                strokeWidth={1.5}
              />
              <span className="text-sm">商案列表</span>
            </Link>

            {/* Project identity */}
            <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}>
              <p className="text-[0.52rem] font-mono uppercase tracking-[0.6em] text-foreground/20 mb-1.5 select-none">
                PROJECT
              </p>
              <p className="font-serif text-[0.9rem] leading-snug text-foreground/80 truncate">
                {projectName ?? <span className="text-foreground/20 animate-pulse">…</span>}
              </p>
            </div>

            {/* MANAGE items */}
            <div className="space-y-1 mt-1">
              <SectionLabel>MANAGE</SectionLabel>
              {MANAGE.map(({ seg, label, Icon }) => {
                const href   = `/merchant/projects/${projectId}/${seg}`
                const active = pathname.startsWith(href)
                return (
                  <Link
                    key={seg}
                    href={href}
                    onClick={onNavigate}
                    className={cn('sidebar-link', active && 'sidebar-link-active')}
                  >
                    <Icon
                      className={cn('h-5 w-5 transition-colors duration-200', active ? 'text-foreground' : 'text-muted-foreground')}
                      strokeWidth={1.5}
                    />
                    <span className="text-sm">{label}</span>
                  </Link>
                )
              })}
            </div>

            {/* ANALYSE items */}
            <div className="space-y-1">
              <SectionLabel gold>ANALYSE</SectionLabel>
              {ANALYSE.map(({ seg, label, Icon }) => {
                const href   = `/merchant/projects/${projectId}/${seg}`
                const active = pathname.startsWith(href)
                return (
                  <Link
                    key={seg}
                    href={href}
                    onClick={onNavigate}
                    className={cn('sidebar-link', active && 'sidebar-link-active')}
                    style={active ? { borderLeftColor: '#c4913a', background: 'rgba(196,145,58,0.06)', color: '#7c5a1e' } : {}}
                  >
                    <Icon
                      className="h-5 w-5 transition-colors duration-200"
                      style={{ color: active ? '#c4913a' : undefined }}
                      strokeWidth={1.5}
                    />
                    <span className="text-sm">{label}</span>
                  </Link>
                )
              })}
            </div>
          </motion.div>

        ) : (

          /* ── GLOBAL MODE ──────────────────────────────────────────────── */
          <motion.div
            key="global"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-1"
          >
            {[
              { href: '/merchant/home',     label: '首頁',     Icon: Home       },
              { href: '/merchant/projects', label: '商案管理', Icon: LayoutGrid },
            ].map(({ href, label, Icon }) => {
              const active =
                href === '/merchant/home'
                  ? pathname === href
                  : pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={cn('sidebar-link', active && 'sidebar-link-active')}
                >
                  <Icon
                    className={cn('h-5 w-5 transition-colors duration-200', active ? 'text-foreground' : 'text-muted-foreground')}
                    strokeWidth={1.5}
                  />
                  <span className="text-sm">{label}</span>
                </Link>
              )
            })}
          </motion.div>
        )}

      </AnimatePresence>
    </nav>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function MerchantDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="editorial-container-wide">
      <div className="flex min-h-screen">

        {/* Desktop sidebar — matches KOL: w-72, border-r */}
        <aside className="hidden lg:block w-72 min-h-screen border-r border-border bg-background shrink-0">
          <SidebarContent />
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="py-10 lg:py-16 px-6 lg:pl-10 lg:pr-12">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
