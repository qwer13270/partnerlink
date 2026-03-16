'use client'

export function useLocale() {
  return {
    locale: 'zh-TW' as const,
    isZhTW: true,
    getLocalizedValue: <T>(zhValue: T, _enValue: T): T => zhValue,
  }
}
