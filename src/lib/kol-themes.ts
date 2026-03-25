// ── KOL Resume Colour Themes ──────────────────────────────────────────────
// All themes are dark-background. Accent is injected throughout the page
// (hero glow, stat numbers, section dividers, tags, tabs, avatar ring).

export const KOL_THEMES = {
  noir: {
    label:             '深夜金',
    '--k-hero':        '#0B0A09',
    '--k-body':        '#0F0D0B',
    '--k-accent':      '#C9A96E',
    '--k-accent-dim':  'rgba(201,169,110,0.15)',
    '--k-accent-line': 'rgba(201,169,110,0.22)',
    '--k-accent-tag':  'rgba(201,169,110,0.28)',
  },
  slate: {
    label:             '海藍',
    '--k-hero':        '#050813',
    '--k-body':        '#080C1A',
    '--k-accent':      '#4B98D6',
    '--k-accent-dim':  'rgba(75,152,214,0.14)',
    '--k-accent-line': 'rgba(75,152,214,0.20)',
    '--k-accent-tag':  'rgba(75,152,214,0.28)',
  },
  carbon: {
    label:             '暖炭',
    '--k-hero':        '#0F0D0C',
    '--k-body':        '#161311',
    '--k-accent':      '#C8A882',
    '--k-accent-dim':  'rgba(200,168,130,0.13)',
    '--k-accent-line': 'rgba(200,168,130,0.18)',
    '--k-accent-tag':  'rgba(200,168,130,0.25)',
  },
  forest: {
    label:             '深林',
    '--k-hero':        '#050D08',
    '--k-body':        '#080F0A',
    '--k-accent':      '#52A870',
    '--k-accent-dim':  'rgba(82,168,112,0.14)',
    '--k-accent-line': 'rgba(82,168,112,0.20)',
    '--k-accent-tag':  'rgba(82,168,112,0.28)',
  },
  rose: {
    label:             '玫瑰',
    '--k-hero':        '#0E070E',
    '--k-body':        '#140A14',
    '--k-accent':      '#D46882',
    '--k-accent-dim':  'rgba(212,104,130,0.14)',
    '--k-accent-line': 'rgba(212,104,130,0.20)',
    '--k-accent-tag':  'rgba(212,104,130,0.28)',
  },
} as const

export type KolThemeKey = keyof typeof KOL_THEMES
export const DEFAULT_KOL_THEME: KolThemeKey = 'noir'

/** Returns only the CSS custom-property keys (strips `label`) */
export function getKolThemeVars(key: string): Record<string, string> {
  const { label: _, ...vars } = KOL_THEMES[(key as KolThemeKey)] ?? KOL_THEMES[DEFAULT_KOL_THEME]
  void _
  return vars as Record<string, string>
}
