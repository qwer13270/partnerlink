"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, Phone, MapPin } from "lucide-react";
import { strings, interpolate } from "@/lib/strings";
import Logo from "@/components/Logo";


const NAV_COLUMNS: { heading: string; sub: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "平台",
    sub: "Platform",
    links: [
      { label: "首頁",       href: "/" },
    ],
  },
  {
    heading: "資源",
    sub: "Resources",
    links: [
      { label: "登入",       href: "/login" },
      { label: "註冊",       href: "/signup" },
      { label: "建案瀏覽",   href: "/properties" },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="partnerlink-landing relative isolate overflow-hidden bg-black text-white border-t border-white/10">
      {/* ── Ambient backdrop (radial bloom + faint grid) ────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 18% 0%, rgba(50,100,210,0.18), transparent 55%), radial-gradient(ellipse at 82% 100%, rgba(30,70,160,0.12), transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.045]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 30%, transparent 80%)',
        }}
      />

      {/* Top fade-in from black to soften the section seam */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 right-0 h-24"
        style={{ background: 'linear-gradient(to bottom, #000, transparent)' }}
      />

      {/* ── Brand + columns + contact ──────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-20 md:pt-24 pb-14 md:pb-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">

        {/* Brand block */}
        <div className="md:col-span-5 flex flex-col gap-5">
          <Logo href="/" size="sm" />
          <p className="font-body font-light text-sm text-white/60 max-w-sm leading-relaxed">
            台灣領先的品牌聯盟行銷平台。連結優質商案與具影響力的 KOL，
            創造共贏的行銷新模式。
          </p>
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/35 font-body mt-1">
            Brand × Creator · Connected
          </p>
        </div>

        {/* Link columns */}
        {NAV_COLUMNS.map((col) => (
          <div key={col.heading} className="md:col-span-2">
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-body">
                {col.sub}
              </p>
              <p className="font-heading italic text-base text-white/85 mt-0.5">
                {col.heading}
              </p>
            </div>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm font-body text-white/70 hover:text-white transition-colors duration-200"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact column */}
        <div className="md:col-span-3">
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-body">
              Contact
            </p>
            <p className="font-heading italic text-base text-white/85 mt-0.5">
              聯絡
            </p>
          </div>
          <ul className="space-y-3 font-body text-sm">
            <li>
              <a
                href="mailto:Showshowkao@partnerlink.com.tw"
                className="group inline-flex items-start gap-2 text-white/75 hover:text-white transition-colors duration-200"
              >
                <Mail className="h-3.5 w-3.5 mt-1 text-white/45 group-hover:text-white/85 transition-colors" strokeWidth={1.6} />
                <span className="break-all">Showshowkao@partnerlink.com.tw</span>
              </a>
            </li>
            <li className="inline-flex items-center gap-2 text-white/75">
              <Phone className="h-3.5 w-3.5 text-white/45" strokeWidth={1.6} />
              02-2711-0339
            </li>
            <li className="inline-flex items-start gap-2 text-white/55">
              <MapPin className="h-3.5 w-3.5 mt-1 text-white/45" strokeWidth={1.6} />
              <span>台北市大安區市民大道三段 198 號 6 樓</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────── */}
      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-body uppercase tracking-[0.18em]">
          <p className="text-white/45">
            {interpolate(strings.footer.copyright, { year: currentYear })}
          </p>
          <p className="text-white/40 text-center md:text-right max-w-md normal-case tracking-normal text-[12px]">
            {strings.footer.disclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}
