'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────────────────
type Role = 'kol' | 'merchant'

type CollabRequest = {
  id: string
  project_id: string
  project_name: string | null
  kol_name: string | null
  merchant_company_name: string | null
  sender_role: 'merchant' | 'kol'
  status: 'pending' | 'accepted' | 'declined' | 'cancelled'
  created_at: string
  responded_at: string | null
}

type Notif = {
  id: string
  text: string
  time: string
  href: string
  accent: string
  isUnread: boolean
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1)  return '剛剛'
  if (m < 60) return `${m} 分鐘前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小時前`
  return `${Math.floor(h / 24)} 天前`
}

function within7Days(iso: string) {
  return Date.now() - new Date(iso).getTime() < SEVEN_DAYS_MS
}

function toNotif(r: CollabRequest, role: Role, lastReadAt: number): Notif | null {
  const project  = r.project_name          ?? '商案'
  const kol      = r.kol_name              ?? 'KOL'
  const merchant = r.merchant_company_name ?? '商家'

  if (role === 'kol') {
    // Merchant invited this KOL
    if (r.sender_role === 'merchant' && r.status === 'pending' && within7Days(r.created_at)) {
      return {
        id: r.id, href: '/kol/inbox', accent: 'bg-blue-400',
        text: `${merchant} 邀請你推廣「${project}」`,
        time: timeAgo(r.created_at),
        isUnread: new Date(r.created_at).getTime() > lastReadAt,
      }
    }
    // KOL applied, merchant responded
    if (r.sender_role === 'kol' && (r.status === 'accepted' || r.status === 'declined')) {
      const ts = r.responded_at ?? r.created_at
      if (!within7Days(ts)) return null
      return {
        id: r.id, href: r.status === 'accepted' ? '/kol/projects' : '/kol/inbox',
        accent: r.status === 'accepted' ? 'bg-emerald-500' : 'bg-red-400',
        text: r.status === 'accepted'
          ? `你在「${project}」的申請已通過`
          : `你在「${project}」的申請未通過`,
        time: timeAgo(ts),
        isUnread: new Date(ts).getTime() > lastReadAt,
      }
    }
    return null
  }

  // Merchant role
  // KOL responded to merchant's invite
  if (r.sender_role === 'merchant' && (r.status === 'accepted' || r.status === 'declined')) {
    const ts = r.responded_at ?? r.created_at
    if (!within7Days(ts)) return null
    return {
      id: r.id, href: `/merchant/projects/${r.project_id}/kols`,
      accent: r.status === 'accepted' ? 'bg-emerald-500' : 'bg-red-400',
      text: r.status === 'accepted'
        ? `${kol} 接受了「${project}」的合作邀請`
        : `${kol} 婉拒了「${project}」的合作邀請`,
      time: timeAgo(ts),
      isUnread: new Date(ts).getTime() > lastReadAt,
    }
  }
  // KOL applied to merchant's project
  if (r.sender_role === 'kol' && r.status === 'pending' && within7Days(r.created_at)) {
    return {
      id: r.id, href: `/merchant/projects/${r.project_id}/kols`,
      accent: 'bg-blue-400',
      text: `${kol} 申請推廣「${project}」`,
      time: timeAgo(r.created_at),
      isUnread: new Date(r.created_at).getTime() > lastReadAt,
    }
  }
  return null
}

// ── Component ────────────────────────────────────────────────────────────────
export default function NotificationBell({ role }: { role: Role }) {
  const [open, setOpen]     = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef   = useRef<HTMLButtonElement>(null)
  const lsKey    = `homekey_notif_read_${role}`

  const getLastRead = useCallback(() => {
    try { return parseInt(localStorage.getItem(lsKey) ?? '0', 10) } catch { return 0 }
  }, [lsKey])

  useEffect(() => {
    async function load() {
      try {
        const res     = await fetch('/api/collaboration-requests')
        const payload = await res.json().catch(() => null) as { requests?: CollabRequest[] } | null
        if (!res.ok || !payload?.requests) return
        const lastRead = getLastRead()
        setNotifs(
          payload.requests
            .map(r => toNotif(r, role, lastRead))
            .filter((n): n is Notif => n !== null),
        )
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [role, getLastRead])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current   && !btnRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function handleOpen() {
    setOpen(v => {
      if (!v) {
        // Mark all as read when opening
        try { localStorage.setItem(lsKey, Date.now().toString()) } catch {}
        setNotifs(prev => prev.map(n => ({ ...n, isUnread: false })))
      }
      return !v
    })
  }

  const unreadCount = notifs.filter(n => n.isUnread).length

  return (
    <div className="fixed top-5 right-5 z-40">

      {/* ── Bell button ── */}
      <button
        ref={btnRef}
        onClick={handleOpen}
        aria-label="通知"
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-background border border-foreground/[0.12] shadow-sm hover:bg-linen active:scale-[0.95] transition-all duration-150"
      >
        <Bell className="h-[1.05rem] w-[1.05rem] text-foreground/65" strokeWidth={1.75} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{   scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute -top-0.5 -right-0.5 h-[1.05rem] w-[1.05rem] rounded-full bg-foreground text-background text-[0.5rem] font-semibold flex items-center justify-center leading-none"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* ── Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-[22rem] rounded-xl border border-foreground/[0.09] bg-background shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/[0.07]">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">最新動態</p>
              <p className="text-[0.65rem] text-muted-foreground font-mono opacity-60">近 7 天</p>
            </div>

            {/* List */}
            <div className="divide-y divide-foreground/[0.06] max-h-[min(440px,60vh)] overflow-y-auto">
              {loading ? (
                [0, 1, 2].map(i => (
                  <div key={i} className="flex gap-3 px-4 py-3.5">
                    <div className="w-0.5 self-stretch rounded-full bg-foreground/[0.08] shrink-0" />
                    <div className="flex-1 space-y-2 py-0.5">
                      <div className="h-3 w-4/5 rounded bg-foreground/[0.07] animate-pulse" />
                      <div className="h-2.5 w-1/4 rounded bg-foreground/[0.05] animate-pulse" />
                    </div>
                  </div>
                ))
              ) : notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2.5">
                  <Bell className="h-5 w-5 text-muted-foreground/25" strokeWidth={1.5} />
                  <p className="text-xs text-muted-foreground/40">近 7 天內無新通知</p>
                </div>
              ) : (
                notifs.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className={`group flex gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-foreground/[0.025] ${
                        n.isUnread ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      {/* Left accent bar */}
                      <div className={`w-0.5 rounded-full shrink-0 self-stretch ${n.accent}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[0.82rem] leading-snug ${n.isUnread ? 'font-medium text-foreground' : 'text-foreground/80'}`}>
                          {n.text}
                        </p>
                        <p className="text-[0.67rem] text-muted-foreground font-mono mt-1">{n.time}</p>
                      </div>
                      {n.isUnread && (
                        <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                      )}
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
