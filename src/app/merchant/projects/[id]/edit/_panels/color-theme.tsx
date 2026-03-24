'use client'

import { PROPERTY_THEMES, DEFAULT_THEME_KEY } from '@/lib/property-template'
import type { PropertyThemeKey } from '@/lib/property-template'
import type { PanelProps } from '../_types'

const THEME_LABELS: Record<PropertyThemeKey, { zh: string; en: string }> = {
  'dark-gold':   { zh: '暗金',  en: 'Dark Gold'   },
  'ivory':       { zh: '象牙',  en: 'Ivory'       },
  'graphite':    { zh: '石墨',  en: 'Graphite'    },
  'vermillion':  { zh: '暗朱',  en: 'Vermillion'  },
  'cloud':       { zh: '雲霧',  en: 'Cloud Mist'  },
}

export function ColorThemePanel({ module, onModuleChange }: PanelProps) {
  const current = (module.settings.themeKey ?? DEFAULT_THEME_KEY) as PropertyThemeKey

  return (
    <div className="space-y-5">
      <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
        選擇商案頁面的整體色彩風格。變更後需儲存才會套用至公開頁面。
      </p>

      <div className="grid grid-cols-1 gap-2">
        {(Object.entries(PROPERTY_THEMES) as [PropertyThemeKey, typeof PROPERTY_THEMES[PropertyThemeKey]][]).map(
          ([key, vars]) => {
            const selected = current === key
            const label = THEME_LABELS[key]

            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  onModuleChange(module.id, (m) => ({
                    ...m,
                    settings: { ...m.settings, themeKey: key },
                  }))
                }
                className={`flex items-center gap-4 rounded-none border px-4 py-3 text-left transition-colors duration-150 ${
                  selected
                    ? 'border-foreground bg-foreground/[0.04]'
                    : 'border-border hover:border-foreground/40'
                }`}
              >
                {/* Colour swatch strip */}
                <div className="flex h-8 w-20 flex-none overflow-hidden rounded-sm shadow-sm">
                  {/* BG band */}
                  <div className="flex-[3]" style={{ background: vars['--p-bg'] }} />
                  {/* Card band */}
                  <div className="flex-[2]" style={{ background: vars['--p-bg-card'] }} />
                  {/* Accent band */}
                  <div className="flex-[2]" style={{ background: vars['--p-accent'] }} />
                  {/* Text band */}
                  <div className="flex-[1]" style={{ background: vars['--p-text'] }} />
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none">{label.zh}</p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                    {label.en}
                  </p>
                </div>

                {/* Selected indicator */}
                {selected && (
                  <svg className="h-3.5 w-3.5 shrink-0 text-foreground" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )
          },
        )}
      </div>
    </div>
  )
}
