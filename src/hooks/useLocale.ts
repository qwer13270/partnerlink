'use client'

import { useLocale as useNextIntlLocale } from 'next-intl'
import { type Locale } from '@/i18n/config'

export function useLocale() {
  const locale = useNextIntlLocale() as Locale

  const getLocalizedValue = <T>(zhValue: T, _enValue: T): T => zhValue

  return {
    locale,
    isZhTW: true,
    getLocalizedValue,
  }
}
