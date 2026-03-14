'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Brand SVG icons ─────────────────────────────────────────────────────────
function IgIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}
function TkIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.72a4.85 4.85 0 01-1.01-.03z"/>
    </svg>
  )
}
function FbIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}
function ThIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 011.228.017 8.37 8.37 0 011.3.228c-.12-.81-.374-1.418-.755-1.81-.513-.529-1.31-.797-2.362-.797h-.019c-.834.004-2.227.198-3.02 1.512l-1.737-1.05c1.022-1.697 2.815-2.615 5.09-2.616.006 0 .013 0 .019 0 1.61 0 2.993.44 3.995 1.477 1.001 1.037 1.552 2.59 1.635 4.618 0 .008 0 .017.001.025.027.023.053.046.08.071a6.53 6.53 0 011.964 2.693c.835 1.91.726 4.6-1.643 6.905-1.946 1.898-4.33 2.637-7.558 2.657zm1.35-12.003c-.163 0-.328.005-.493.015-1.028.06-1.9.358-2.452.836-.497.431-.734.982-.7 1.596.065 1.146 1.215 1.832 2.84 1.744 1.218-.065 2.076-.496 2.636-1.32.516-.763.782-1.876.785-3.31-.423-.073-.85-.107-1.288-.116a12.082 12.082 0 00-.328-.006v.561z"/>
    </svg>
  )
}

// ── Platform brand config ────────────────────────────────────────────────────
type PlatformMeta = {
  color: string
  bg: string
  Icon: (props: { color: string }) => React.ReactElement
  prefix: string
  hint: string
}

const PLATFORM_META: Record<string, PlatformMeta> = {
  Instagram: { color: '#C13584', bg: 'rgba(193,53,132,0.05)', Icon: IgIcon, prefix: '@', hint: 'yourhandle' },
  TikTok:    { color: '#161823', bg: 'rgba(22,24,35,0.05)',   Icon: TkIcon, prefix: '@', hint: 'yourhandle' },
  Threads:   { color: '#101010', bg: 'rgba(0,0,0,0.04)',      Icon: ThIcon, prefix: '@', hint: 'yourhandle' },
  Facebook:  { color: '#1877F2', bg: 'rgba(24,119,242,0.05)', Icon: FbIcon, prefix: '@', hint: 'yourpage'   },
}

// ── Component ────────────────────────────────────────────────────────────────
export function PlatformCard({
  platform,
  isSelected,
  accountValue,
  showAccountInput = true,
  inputRequired = true,
  onToggle,
  onAccountChange,
}: {
  platform: string
  isSelected: boolean
  accountValue: string
  showAccountInput?: boolean
  inputRequired?: boolean
  onToggle: () => void
  onAccountChange: (v: string) => void
}) {
  const meta = PLATFORM_META[platform] ?? { color: '#1A1A1A', bg: 'rgba(0,0,0,0.04)', Icon: IgIcon, prefix: '@', hint: 'yourhandle' }
  const isFilled = isSelected && (!showAccountInput || accountValue.trim().length > 0)

  return (
    <div
      className="relative overflow-hidden transition-all duration-200"
      style={{
        border: `1px solid ${isSelected ? meta.color : '#E8E4DF'}`,
        backgroundColor: isSelected ? meta.bg : 'transparent',
      }}
    >
      {/* Left accent strip */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        animate={{ scaleY: isSelected ? 1 : 0 }}
        initial={false}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{ backgroundColor: meta.color, transformOrigin: 'top' }}
      />

      {/* Card header row */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 pl-[18px] cursor-pointer"
      >
        <span className="flex-shrink-0 transition-transform duration-200" style={{ transform: isSelected ? 'scale(1.1)' : 'scale(1)' }}>
          <meta.Icon color={isSelected ? meta.color : '#AEAAA5'} />
        </span>

        <span
          className="text-sm font-medium flex-1 text-left tracking-wide transition-colors duration-200"
          style={{ color: isSelected ? '#1A1A1A' : '#6B6560' }}
        >
          {platform}
        </span>

        <AnimatePresence mode="wait">
          {isSelected ? (
            <motion.span
              key="active"
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 45 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              className="flex-shrink-0 flex items-center justify-center"
            >
              {isFilled ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="8.5" fill={meta.color} stroke={meta.color} />
                  <path d="M5.5 9l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="8.5" stroke={meta.color} />
                  <path d="M9 5.5v7M5.5 9h7" stroke={meta.color} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </motion.span>
          ) : (
            <motion.span
              key="inactive"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex-shrink-0 flex items-center justify-center"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8.5" stroke="#D8D4CF" />
                <path d="M9 5.5v7M5.5 9h7" stroke="#D8D4CF" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Animated username input */}
      <AnimatePresence>
        {isSelected && showAccountInput && (
          <motion.div
            key="input-area"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-[18px] pb-4">
              <div
                className="flex items-stretch bg-white transition-all duration-150"
                style={{ border: `1px solid ${accountValue.trim() ? meta.color : '#D8D4CF'}` }}
              >
                <span
                  className="flex items-center px-3 text-xs font-bold tracking-wider border-r select-none shrink-0 transition-colors duration-150"
                  style={{
                    color: meta.color,
                    borderColor: accountValue.trim() ? meta.color : '#D8D4CF',
                    letterSpacing: '0.05em',
                  }}
                >
                  {meta.prefix}
                </span>
                <input
                  autoFocus
                  type="text"
                  required={inputRequired}
                  placeholder={meta.hint}
                  value={accountValue}
                  onChange={(e) => onAccountChange(e.target.value)}
                  className="flex-1 py-2.5 px-3 text-sm bg-transparent outline-none text-[#1A1A1A] placeholder:text-[#C0BAB3]"
                />
                {accountValue.trim() && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center pr-3"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6.5" fill={meta.color} />
                      <path d="M4 7l2 2 4-3.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
