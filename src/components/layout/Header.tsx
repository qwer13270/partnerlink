"use client";

import Link from "next/link";
import { Menu, X, ArrowUpRight, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import { getRoleFromUser, resolveRoleHomePath } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { label: "關於我們", href: "/about" },
  { label: "合作商案", href: "/properties" },
  { label: "成為 KOL", href: "/join/kol" },
];

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/[\s@_-]/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background text-[11px] font-medium tracking-wide shrink-0">
      {initials || "U"}
    </span>
  );
}

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null | undefined>(undefined);
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

  // Close user menu on outside click
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

  const authResolved = user !== undefined;
  const isLoggedIn = Boolean(user);
  const role = getRoleFromUser(user ?? null);
  const dashboardHref = role ? resolveRoleHomePath(role) : null;
  const dashboardLabel =
    role === "merchant"
      ? "商家儀表板"
      : role === "admin"
        ? "管理者儀表板"
        : "KOL 儀表板";
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
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-background/95 backdrop-blur-md border-b border-border">
          <div className="editorial-container">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 shrink-0 group">
                <span className="font-serif text-[15px] font-normal tracking-tight group-hover:opacity-70 transition-opacity duration-200">
                  HomeKey
                </span>
                <span className="text-[9px] tracking-[0.22em] text-muted-foreground uppercase mt-0.5">
                  房客
                </span>
              </Link>

              {/* Desktop Center Nav — shown only when logged out */}
              {!isLoggedIn && authResolved && (
                <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                  {NAV_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="relative text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors duration-200 group py-1"
                    >
                      {item.label}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-foreground group-hover:w-full transition-all duration-300 ease-out" />
                    </Link>
                  ))}
                </nav>
              )}

              {/* Desktop Right */}
              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <>
                    {/* Role pill */}
                    {role && (
                      <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground border border-border px-2.5 py-1 leading-none">
                        {roleLabel}
                      </span>
                    )}

                    {/* Dashboard link */}
                    {dashboardHref && (
                      <Link
                        href={dashboardHref}
                        className="flex items-center gap-1 text-[11px] uppercase tracking-[0.15em] text-foreground hover:text-muted-foreground transition-colors duration-200"
                      >
                        {dashboardLabel}
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    )}

                    {/* Divider */}
                    <div className="w-px h-4 bg-border" />

                    {/* Avatar + dropdown */}
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-1.5 hover:opacity-75 transition-opacity duration-200"
                        aria-label="用戶選單"
                      >
                        <Avatar name={displayName} />
                        <ChevronDown
                          className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${
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
                            transition={{ duration: 0.18 }}
                            className="absolute right-0 top-full mt-3 w-52 bg-background border border-border shadow-sm"
                          >
                            <div className="px-4 py-3 border-b border-border">
                              <p className="text-xs font-medium truncate leading-none">
                                {displayName}
                              </p>
                              {role && (
                                <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-[0.15em]">
                                  {roleLabel}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={handleLogout}
                              className="flex items-center justify-between w-full px-4 py-3 text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
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
                      className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      登入
                    </Link>
                    <div className="w-px h-4 bg-border" />
                    <Button
                      asChild
                      size="sm"
                      className="rounded-none text-[11px] uppercase tracking-[0.15em] bg-foreground text-background hover:bg-foreground/85 h-8 px-4"
                    >
                      <Link href="/onboarding">立即加入</Link>
                    </Button>
                  </>
                ) : (
                  <div className="h-8 w-32" />
                )}
              </div>

              {/* Mobile Hamburger */}
              <button
                className="md:hidden p-1.5 -mr-1.5 text-foreground hover:opacity-60 transition-opacity duration-200"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="開啟選單"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-xs bg-background border-l border-border md:hidden flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
                {isLoggedIn ? (
                  <div className="flex items-center gap-3">
                    <Avatar name={displayName} />
                    <div>
                      <p className="text-sm font-medium leading-none truncate max-w-[140px]">
                        {displayName}
                      </p>
                      {role && (
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-1">
                          {roleLabel}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="font-serif text-sm tracking-tight text-muted-foreground">
                    選單
                  </span>
                )}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 -mr-1.5 hover:opacity-60 transition-opacity duration-200"
                  aria-label="關閉選單"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav Links */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {(isLoggedIn
                  ? dashboardHref
                    ? [{ label: dashboardLabel, href: dashboardHref }]
                    : []
                  : [...NAV_LINKS, { label: "立即加入", href: "/onboarding" }]
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
                      className="flex items-center justify-between py-4 border-b border-border/60 text-foreground hover:text-muted-foreground transition-colors duration-200"
                    >
                      <span className="text-[12px] uppercase tracking-[0.14em]">
                        {item.label}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Panel Footer */}
              <div className="px-6 py-5 border-t border-border shrink-0">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-between w-full text-[12px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <span>登出</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                ) : authResolved ? (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between w-full text-[12px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors duration-200"
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
    </>
  );
}
