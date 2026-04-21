'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import ProjectTypeBadge from '@/components/kol/ProjectTypeBadge'

type CollabRow = {
  request_id: string
  collaboration_id: string | null
  project_name: string | null
  project_type: 'property' | 'shop' | null
  merchant_company_name: string | null
}

interface KolSearchPaletteProps {
  open: boolean
  onClose: () => void
}

function getInitials(name: string): string {
  return (
    name
      .split(/[\s@_-]/)
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '??'
  )
}

export default function KolSearchPalette({ open, onClose }: KolSearchPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [collabs, setCollabs] = useState<CollabRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch on each open to keep the list fresh (collabs change as invites get accepted).
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        const res = await fetch('/api/kol/my-collabs', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: 'no-store',
        })
        const payload = (await res.json().catch(() => null)) as
          | { ok?: boolean; collabs?: CollabRow[]; error?: string }
          | null
        if (cancelled) return
        if (!res.ok || !payload?.ok) {
          setError(payload?.error ?? '讀取失敗。')
          setCollabs([])
        } else {
          setCollabs(payload.collabs ?? [])
        }
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message)
          setCollabs([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
    setQuery('')
    setActiveIndex(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const filtered = useMemo(() => {
    const all = collabs ?? []
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter((c) => {
      const hay = [c.merchant_company_name, c.project_name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [collabs, query])

  useEffect(() => {
    setActiveIndex((i) => (filtered.length === 0 ? 0 : Math.min(i, filtered.length - 1)))
  }, [filtered.length])

  const handleSelect = (item: CollabRow) => {
    if (item.collaboration_id) {
      router.push(`/kol/projects/${item.collaboration_id}`)
    } else {
      router.push('/kol/inbox')
    }
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }
    if (filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[activeIndex]
      if (item) handleSelect(item)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onMouseDown={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="liquid-glass-strong relative z-10 w-full max-w-xl !rounded-2xl overflow-hidden text-white"
            role="dialog"
            aria-modal="true"
            aria-label="搜尋合作商家"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
              <Search className="h-4 w-4 text-white/55" strokeWidth={1.6} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜尋合作過的商家或商案…"
                className="search-input flex-1 text-sm bg-transparent text-white placeholder:text-white/40"
                autoComplete="off"
              />
              <span className="meta text-[9px] text-white/40 px-1.5 py-0.5 rounded border border-white/10">
                ESC
              </span>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2">
              {loading && collabs === null ? (
                <div className="px-5 py-10 text-center text-xs text-white/45">載入中…</div>
              ) : error ? (
                <div className="px-5 py-10 text-center text-xs text-rose-300/80">{error}</div>
              ) : (collabs ?? []).length === 0 ? (
                <div className="px-5 py-10 text-center text-xs text-white/45">
                  尚無合作紀錄
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-5 py-10 text-center text-xs text-white/50">尚無結果</div>
              ) : (
                <div className="flex flex-col">
                  <div className="meta text-[10px] text-white/40 px-5 pt-3 pb-1.5">
                    合作過 · {filtered.length}
                  </div>
                  {filtered.map((c, idx) => {
                    const active = idx === activeIndex
                    const merchant = c.merchant_company_name ?? '未知商家'
                    return (
                      <button
                        key={c.request_id}
                        type="button"
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => handleSelect(c)}
                        className={cn(
                          'flex items-center gap-4 px-5 py-3 text-left transition-colors',
                          active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]',
                        )}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[11px] text-white/75">
                          {getInitials(merchant)}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="text-[13px] text-white/90 truncate">
                              {c.project_name ?? '未知案名'}
                            </span>
                            <ProjectTypeBadge type={c.project_type} />
                          </span>
                          <span className="meta block text-[10px] text-white/45 mt-0.5 truncate">
                            {merchant}
                          </span>
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-white/40 shrink-0" strokeWidth={1.6} />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/10 meta text-[10px] text-white/35">
              <span className="flex items-center gap-3">
                <span>↑↓ 移動</span>
                <span>↵ 開啟</span>
                <span>ESC 關閉</span>
              </span>
              <span>⌘K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
