'use client'

import Link from 'next/link'

interface LogoProps {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { circle: 'h-9 w-9',   svg: 20, text: 'text-lg' },
  md: { circle: 'h-11 w-11', svg: 22, text: 'text-xl' },
  lg: { circle: 'h-13 w-13', svg: 26, text: 'text-2xl' },
}

export default function Logo({ href = '/', size = 'md', className = '' }: LogoProps) {
  const s = sizeMap[size]

  return (
    <Link href={href} className={`flex items-center gap-2.5 group ${className}`}>
      <div className={`${s.circle} rounded-full liquid-glass-strong flex items-center justify-center relative shrink-0`}>
        <svg width={s.svg} height={s.svg} viewBox="0 0 32 32" fill="none" className="relative z-10" aria-hidden="true">
          <defs>
            <linearGradient id="logo-g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#dbeafe" />
              <stop offset="1" stopColor="#7aa8ff" />
            </linearGradient>
            <linearGradient id="logo-g2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#6497ff" />
            </linearGradient>
          </defs>
          <path d="M13 6a7 7 0 0 0 0 14h3" stroke="url(#logo-g1)" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M19 26a7 7 0 0 0 0-14h-3" stroke="url(#logo-g2)" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="16" cy="16" r="1.8" fill="#ffffff" />
        </svg>
      </div>
      <span className={`font-body font-semibold ${s.text} text-white leading-none tracking-tight`}>
        Partner<span className="text-white/50">link</span>
      </span>
    </Link>
  )
}
