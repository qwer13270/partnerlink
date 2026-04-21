"use client";

import Link from "next/link";
import { Menu, X, ArrowUpRight, ChevronDown, Bell } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getRoleFromUser, resolveRoleHomePath } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import ProfilePhotoModal from "./ProfilePhotoModal";

// ── Notification Bell (header variant — dark liquid-glass) ───────────────────
type NotifRole = 'kol' | 'merchant'

type CollabRequest = {
  id: string; project_id: string; project_name: string | null
  kol_name: string | null; merchant_company_name: string | null
  sender_role: 'merchant' | 'kol'
  status: 'pending' | 'accepted' | 'declined' | 'cancelled'
  created_at: string; responded_at: string | null
}

type Notif = { id: string; text: string; time: string; href: string; accent: string; isUnread: boolean }
type ActivityNotif = { id: string; type: string; title: string; href: string; created_at: string }

const ACTIVITY_ACCENT: Record<string, string> = {
  new_inquiry: 'bg-sky-300',
  visited:     'bg-indigo-300',
  deal:        'bg-emerald-300',
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return '剛剛'
  if (m < 60) return `${m} 分鐘前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小時前`
  return `${Math.floor(h / 24)} 天前`
}
function within7(iso: string) { return Date.now() - new Date(iso).getTime() < SEVEN_DAYS_MS }

function toNotif(r: CollabRequest, role: NotifRole, lastRead: number): Notif | null {
  const project = r.project_name ?? '商案'
  const kol = r.kol_name ?? 'KOL'
  const merchant = r.merchant_company_name ?? '商家'

  if (role === 'kol') {
    if (r.sender_role === 'merchant' && r.status === 'pending' && within7(r.created_at))
      return { id: r.id, href: '/kol/inbox', accent: 'bg-sky-300', text: `${merchant} 邀請你推廣「${project}」`, time: timeAgo(r.created_at), isUnread: new Date(r.created_at).getTime() > lastRead }
    if (r.sender_role === 'kol' && (r.status === 'accepted' || r.status === 'declined')) {
      const ts = r.responded_at ?? r.created_at
      if (!within7(ts)) return null
      return { id: r.id, href: r.status === 'accepted' ? '/kol/projects' : '/kol/inbox', accent: r.status === 'accepted' ? 'bg-emerald-300' : 'bg-red-300', text: r.status === 'accepted' ? `你在「${project}」的申請已通過` : `你在「${project}」的申請未通過`, time: timeAgo(ts), isUnread: new Date(ts).getTime() > lastRead }
    }
    return null
  }
  if (r.sender_role === 'merchant' && (r.status === 'accepted' || r.status === 'declined')) {
    const ts = r.responded_at ?? r.created_at
    if (!within7(ts)) return null
    return { id: r.id, href: `/merchant/projects/${r.project_id}/kols`, accent: r.status === 'accepted' ? 'bg-emerald-300' : 'bg-red-300', text: r.status === 'accepted' ? `${kol} 接受了「${project}」的合作邀請` : `${kol} 婉拒了「${project}」的合作邀請`, time: timeAgo(ts), isUnread: new Date(ts).getTime() > lastRead }
  }
  if (r.sender_role === 'kol' && r.status === 'pending' && within7(r.created_at))
    return { id: r.id, href: `/merchant/projects/${r.project_id}/kols`, accent: 'bg-sky-300', text: `${kol} 申請推廣「${project}」`, time: timeAgo(r.created_at), isUnread: new Date(r.created_at).getTime() > lastRead }
  return null
}

export function HeaderBell({ role }: { role: NotifRole }) {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const lsKey = `partnerlink_notif_read_${role}`

  const getLastRead = useCallback(() => {
    try { return parseInt(localStorage.getItem(lsKey) ?? '0', 10) } catch { return 0 }
  }, [lsKey])

  useEffect(() => {
    async function load() {
      try {
        const lastRead = getLastRead()
        const [collabRes, activityRes] = await Promise.all([
          fetch('/api/collaboration-requests'),
          fetch('/api/notifications'),
        ])
        const collabPayload   = await collabRes.json().catch(() => null)   as { requests?: CollabRequest[] } | null
        const activityPayload = await activityRes.json().catch(() => null) as { notifications?: ActivityNotif[] } | null

        const collabNotifs: Notif[] = (collabPayload?.requests ?? [])
          .map(r => toNotif(r, role, lastRead))
          .filter((n): n is Notif => n !== null)

        const activityNotifs: Notif[] = (activityPayload?.notifications ?? []).map(n => ({
          id:       n.id,
          text:     n.title,
          time:     timeAgo(n.created_at),
          href:     n.href,
          accent:   ACTIVITY_ACCENT[n.type] ?? 'bg-white/40',
          isUnread: new Date(n.created_at).getTime() > lastRead,
        }))

        const all = [...collabNotifs, ...activityNotifs].sort((a, b) => {
          if (a.isUnread && !b.isUnread) return -1
          if (!a.isUnread && b.isUnread) return 1
          return 0
        })
        setNotifs(all)
      } finally { setLoading(false) }
    }
    void load()
  }, [role, getLastRead])

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function handleOpen() {
    setOpen(v => {
      if (!v) {
        try { localStorage.setItem(lsKey, Date.now().toString()) } catch {}
        setNotifs(prev => prev.map(n => ({ ...n, isUnread: false })))
      }
      return !v
    })
  }

  const unreadCount = notifs.filter(n => n.isUnread).length

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        aria-label="通知"
        className="relative flex items-center justify-center w-8 h-8 rounded-full text-white/75 hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
      >
        <Bell className="h-[1rem] w-[1rem]" strokeWidth={1.75} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute -top-0.5 -right-0.5 h-[1rem] w-[1rem] rounded-full bg-white text-black text-[0.45rem] font-semibold flex items-center justify-center leading-none"
              style={{ boxShadow: '0 0 10px rgba(180,220,255,0.55)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="liquid-glass-strong !absolute !right-0 !top-full !mt-3 !w-[22rem] !rounded-2xl !overflow-hidden z-50 text-white"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/55 font-body">最新動態</p>
              <p className="text-[0.6rem] text-white/40 font-body uppercase tracking-[0.2em]">近 7 天</p>
            </div>
            <div className="divide-y divide-white/[0.07] max-h-[min(440px,60vh)] overflow-x-hidden overflow-y-auto">
              {loading ? (
                [0, 1, 2].map(i => (
                  <div key={i} className="flex gap-3 px-4 py-3.5">
                    <div className="w-0.5 self-stretch rounded-full bg-white/10 shrink-0" />
                    <div className="flex-1 space-y-2 py-0.5">
                      <div className="h-3 w-4/5 rounded bg-white/[0.07] animate-pulse" />
                      <div className="h-2.5 w-1/4 rounded bg-white/[0.05] animate-pulse" />
                    </div>
                  </div>
                ))
              ) : notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2.5">
                  <Bell className="h-5 w-5 text-white/25" strokeWidth={1.5} />
                  <p className="text-xs text-white/40 font-body">近 7 天內無新通知</p>
                </div>
              ) : (
                notifs.map((n, i) => (
                  <motion.div key={n.id} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }}>
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className={`group flex gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-white/[0.04] ${n.isUnread ? 'bg-white/[0.05]' : ''}`}
                    >
                      <div className={`w-0.5 rounded-full shrink-0 self-stretch ${n.accent}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[0.82rem] leading-snug font-body ${n.isUnread ? 'text-white' : 'text-white/75'}`}>{n.text}</p>
                        <p className="text-[0.65rem] text-white/40 font-body mt-1 uppercase tracking-[0.15em]">{n.time}</p>
                      </div>
                      {n.isUnread && (
                        <span
                          className="mt-[5px] h-1.5 w-1.5 rounded-full bg-sky-300 shrink-0"
                          style={{ boxShadow: '0 0 6px rgba(140,200,255,0.8)' }}
                        />
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

const NAV_LINKS = [
  { label: "關於我們", href: "/about" },
  { label: "成為 KOL", href: "/join/kol" },
];

export function HeaderAvatar({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  const initials = name
    .split(/[\s@_-]/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full overflow-hidden bg-white text-black text-[10px] font-medium tracking-wide shrink-0 ring-1 ring-white/20">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials || "U"
      )}
    </span>
  );
}

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen,    setMobileMenuOpen]    = useState(false);
  const [userMenuOpen,      setUserMenuOpen]      = useState(false);
  const [profileModalOpen,  setProfileModalOpen]  = useState(false);
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const role = getRoleFromUser(user ?? null);

    if (!user || !role || role !== "kol") {
      return;
    }

    const controller = new AbortController();

    fetch("/api/account/profile-photo", {
      method: "GET",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | { profilePhotoUrl?: string | null }
          | null;

        if (!response.ok) {
          setProfilePhotoUrl(null);
          return;
        }

        setProfilePhotoUrl(
          typeof payload?.profilePhotoUrl === "string"
            ? payload.profilePhotoUrl
            : null,
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setProfilePhotoUrl(null);
        }
      });

    return () => controller.abort();
  }, [user]);

  useEffect(() => {
    const handler = (e: Event) => {
      const url = (e as CustomEvent<{ url: string | null }>).detail?.url ?? null
      setProfilePhotoUrl(url)
    }
    window.addEventListener('profile-photo-updated', handler)
    return () => window.removeEventListener('profile-photo-updated', handler)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const role = getRoleFromUser(user ?? null);
  const authResolved = user !== undefined;
  const isLoggedIn = Boolean(user && role);
  const avatarImageUrl = role === "kol" ? profilePhotoUrl : null;
  const dashboardHref = role ? resolveRoleHomePath(role) : null;
  const dashboardLabel =
    role === "merchant" ? "商家後台"
    : role === "admin"  ? "管理者後台"
    :                     "KOL 後台";
  const roleLabel =
    role === "merchant" ? "商家" : role === "admin" ? "管理者" : "KOL";

  const displayName = useMemo(() => {
    const fromMeta = user?.user_metadata?.full_name;
    if (typeof fromMeta === "string" && fromMeta.trim()) return fromMeta.trim();
    const fromEmail = user?.email?.split("@")[0];
    return fromEmail || "user";
  }, [user]);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header className="partnerlink-landing fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* ── Logo (role-aware: send signed-in users to their dashboard) ── */}
            <Logo href={isLoggedIn && dashboardHref ? dashboardHref : "/"} size="sm" />

            {/* ── Desktop center nav (logged-out only) ─────────── */}
            {!isLoggedIn && authResolved && (
              <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative text-[13px] uppercase tracking-[0.18em] font-body text-white/65 hover:text-white transition-colors duration-200 group py-1"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-white/85 group-hover:w-full transition-all duration-300 ease-out" />
                  </Link>
                ))}
              </nav>
            )}

            {/* ── Desktop right cluster ────────────────────────── */}
            <div className="hidden md:flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  {/* Role chip */}
                  {role && (
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/65 border border-white/15 px-2.5 py-1 leading-none rounded-full font-body">
                      {roleLabel}
                    </span>
                  )}

                  {/* Dashboard link */}
                  {dashboardHref && (
                    <Link
                      href={dashboardHref}
                      className="flex items-center gap-1 text-[13px] uppercase tracking-[0.14em] font-body text-white/85 hover:text-white transition-colors duration-200"
                    >
                      {dashboardLabel}
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  )}

                  <div className="w-px h-4 bg-white/15" />

                  {/* Bell */}
                  {(role === 'kol' || role === 'merchant') && (
                    <HeaderBell role={role} />
                  )}

                  {/* Avatar + dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 hover:opacity-85 transition-opacity duration-200"
                      aria-label="用戶選單"
                    >
                      <HeaderAvatar name={displayName} imageUrl={avatarImageUrl} />
                      <ChevronDown
                        className={`w-3 h-3 text-white/55 transition-transform duration-200 ${
                          userMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                          className="liquid-glass-strong !absolute !right-0 !top-full !mt-3 !w-56 !rounded-2xl !overflow-hidden z-50 text-white"
                        >
                          <div className="px-4 py-3.5 border-b border-white/10">
                            <p className="text-sm font-body font-medium truncate text-white">
                              {displayName}
                            </p>
                            {role && (
                              <p className="text-[10px] text-white/50 mt-1 uppercase tracking-[0.25em] font-body">
                                {roleLabel}
                              </p>
                            )}
                          </div>
                          {role === "kol" && (
                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                setProfileModalOpen(true);
                              }}
                              className="flex items-center justify-between w-full px-4 py-3 text-[12px] uppercase tracking-[0.18em] text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors duration-150 font-body"
                            >
                              <span>編輯頭像</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={handleLogout}
                            className="flex items-center justify-between w-full px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-white/65 hover:text-white hover:bg-white/[0.06] transition-colors duration-150 font-body"
                          >
                            <span>登出</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : authResolved ? (
                <>
                  <Link
                    href="/login"
                    className="text-[13px] uppercase tracking-[0.14em] font-body text-white/75 hover:text-white transition-colors duration-200"
                  >
                    登入
                  </Link>
                  <div className="w-px h-4 bg-white/15" />
                  <Link
                    href="/signup"
                    className="bg-white text-black rounded-full px-4 py-1.5 text-[13px] font-body font-medium flex items-center gap-1 hover:bg-white/90 transition-colors duration-200"
                  >
                    立即加入 <ArrowUpRight size={14} />
                  </Link>
                </>
              ) : (
                <div className="h-8 w-32" />
              )}
            </div>

            {/* ── Mobile hamburger ─────────────────────────────── */}
            <button
              className="md:hidden p-1.5 -mr-1.5 text-white/85 hover:text-white transition-colors duration-200"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="開啟選單"
            >
              <Menu className="h-5 w-5" />
            </button>

          </div>
        </div>
      </header>

      {/* ── Mobile menu ───────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="partnerlink-landing fixed top-0 right-0 bottom-0 z-50 w-full max-w-xs md:hidden flex flex-col bg-black text-white border-l border-white/10"
            >
              {/* Ambient backdrop in panel */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-0 opacity-90"
                style={{
                  background:
                    'radial-gradient(ellipse at 100% 0%, rgba(40,90,200,0.18), transparent 55%)',
                }}
              />

              <div className="relative z-10 flex items-center justify-between px-6 h-16 border-b border-white/10 shrink-0">
                {isLoggedIn ? (
                  <div className="flex items-center gap-3">
                    <HeaderAvatar name={displayName} imageUrl={avatarImageUrl} />
                    <div>
                      <p className="text-sm font-body font-medium leading-none truncate max-w-[140px]">
                        {displayName}
                      </p>
                      {role && (
                        <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 mt-1 font-body">
                          {roleLabel}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="font-heading italic text-base text-white/85">
                    Menu
                  </span>
                )}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 -mr-1.5 text-white/65 hover:text-white transition-colors duration-200"
                  aria-label="關閉選單"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4">
                {(isLoggedIn
                  ? dashboardHref
                    ? [{ label: dashboardLabel, href: dashboardHref }]
                    : []
                  : [...NAV_LINKS, { label: "立即加入", href: "/signup" }]
                ).map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.06 + i * 0.04,
                      duration: 0.28,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-4 border-b border-white/[0.07] text-white/85 hover:text-white transition-colors duration-200 font-body"
                    >
                      <span className="text-[13px] uppercase tracking-[0.18em]">
                        {item.label}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="relative z-10 px-6 py-5 border-t border-white/10 shrink-0">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-between w-full text-[12px] uppercase tracking-[0.22em] text-white/65 hover:text-white transition-colors duration-200 font-body"
                  >
                    <span>登出</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                ) : authResolved ? (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between w-full text-[12px] uppercase tracking-[0.22em] text-white/65 hover:text-white transition-colors duration-200 font-body"
                  >
                    <span>登入</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Profile photo modal — KOL only */}
      <ProfilePhotoModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentPhotoUrl={profilePhotoUrl}
        displayName={displayName}
        onPhotoUpdated={(url) => setProfilePhotoUrl(url)}
      />
    </>
  );
}
