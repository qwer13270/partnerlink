'use client'

import {
  PROPERTY_THEMES,
  type PropertyFontKey,
  type PropertyThemeKey,
} from '@/lib/property-template'

// ── Theme metadata ────────────────────────────────────────────────────────────

const THEME_META: Record<PropertyThemeKey, { zh: string; en: string }> = {
  'dark-gold':  { zh: '暗金', en: 'Dark Gold'  },
  'ivory':      { zh: '象牙', en: 'Ivory'      },
  'graphite':   { zh: '石墨', en: 'Graphite'   },
  'vermillion': { zh: '暗朱', en: 'Vermillion' },
  'cloud':      { zh: '雲霧', en: 'Cloud'      },
}

const FONT_META: Record<PropertyFontKey, { zh: string; en: string; sample: string; displayFont: string; bodyFont: string }> = {
  editorial: {
    zh: '雅緻襯線',
    en: 'Editorial',
    sample: '細節與留白，讓建築更顯份量',
    displayFont: 'var(--font-serif-tc-base)',
    bodyFont: 'var(--font-sans-tc-base)',
  },
  modern: {
    zh: '現代黑體',
    en: 'Modern Sans',
    sample: '俐落節奏，適合更當代的商案語氣',
    displayFont: 'var(--font-sans-tc-base)',
    bodyFont: 'var(--font-sans-tc-base)',
  },
}

// ── ThemePicker ───────────────────────────────────────────────────────────────

export function ThemePicker({
  currentTheme,
  onSelect,
}: {
  currentTheme: PropertyThemeKey
  onSelect: (key: PropertyThemeKey) => void
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="px-4 py-4">
        <p className="mb-4 text-xs uppercase tracking-[0.4em] text-muted-foreground/50">
          選擇色彩主題
        </p>
        <div className="space-y-1.5">
          {(Object.entries(PROPERTY_THEMES) as [PropertyThemeKey, (typeof PROPERTY_THEMES)[PropertyThemeKey]][]).map(
            ([key, vars]) => {
              const selected = currentTheme === key
              const { zh, en } = THEME_META[key]
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelect(key)}
                  className={[
                    'group relative flex w-full items-center gap-3 rounded-sm border px-3 py-3 text-left transition-all duration-200',
                    selected
                      ? 'border-foreground/30 bg-foreground/[0.03]'
                      : 'border-foreground/[0.06] hover:border-foreground/[0.15] hover:bg-foreground/[0.015]',
                  ].join(' ')}
                >
                  <div
                    className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0'}`}
                    style={{ background: vars['--p-accent'] }}
                  />
                  <div className="flex h-9 w-[4.5rem] flex-none overflow-hidden rounded-sm shadow-sm">
                    <div className="flex-[4]" style={{ background: vars['--p-bg'] }} />
                    <div className="flex-[2]" style={{ background: vars['--p-bg-card'] }} />
                    <div className="flex-[3]" style={{ background: vars['--p-accent'] }} />
                    <div className="flex-[1]" style={{ background: vars['--p-text'] }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.8rem] font-medium leading-none">{zh}</p>
                    <p className="mt-1.5 text-xs uppercase tracking-[0.3em] text-muted-foreground/50">{en}</p>
                  </div>
                  {selected && (
                    <svg className="h-3 w-3 shrink-0 text-foreground/50" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              )
            },
          )}
        </div>
      </div>
    </div>
  )
}

// ── FontPicker ────────────────────────────────────────────────────────────────

export function FontPicker({
  currentFont,
  onSelect,
}: {
  currentFont: PropertyFontKey
  onSelect: (key: PropertyFontKey) => void
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="px-4 py-4">
        <p className="mb-4 text-xs uppercase tracking-[0.4em] text-muted-foreground/50">
          選擇字型風格
        </p>
        <div className="space-y-2">
          {(Object.entries(FONT_META) as [PropertyFontKey, (typeof FONT_META)[PropertyFontKey]][]).map(
            ([key, meta]) => {
              const selected = currentFont === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelect(key)}
                  className={[
                    'group relative w-full rounded-sm border px-4 py-3 text-left transition-all duration-200',
                    selected
                      ? 'border-foreground/30 bg-foreground/[0.03]'
                      : 'border-foreground/[0.06] hover:border-foreground/[0.15] hover:bg-foreground/[0.015]',
                  ].join(' ')}
                >
                  <div
                    className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0'}`}
                    style={{ background: 'currentColor' }}
                  />
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="text-[0.82rem] font-medium leading-none">{meta.zh}</p>
                        <p className="text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground/55">{meta.en}</p>
                      </div>
                      <p
                        className="mt-3 text-[1.05rem] leading-snug text-foreground"
                        style={{ fontFamily: meta.displayFont, fontWeight: 400 }}
                      >
                        典藏建築語氣
                      </p>
                      <p
                        className="mt-1 text-[0.76rem] leading-relaxed text-muted-foreground"
                        style={{ fontFamily: meta.bodyFont }}
                      >
                        {meta.sample}
                      </p>
                    </div>
                    {selected && (
                      <svg className="mt-1 h-3 w-3 shrink-0 text-foreground/50" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
              )
            },
          )}
        </div>
      </div>
    </div>
  )
}
