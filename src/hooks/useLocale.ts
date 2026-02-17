'use client'

import { useLocale as useNextIntlLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { locales, localeNames, type Locale } from '@/i18n/config'

export function useLocale() {
  const locale = useNextIntlLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: Locale) => {
    // Replace the current locale in the pathname with the new one
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  const getLocalizedValue = <T>(zhValue: T, enValue: T): T => {
    return locale === 'zh-TW' ? zhValue : enValue
  }

  return {
    locale,
    locales,
    localeNames,
    localeName: localeNames[locale],
    switchLocale,
    getLocalizedValue,
    isZhTW: locale === 'zh-TW',
    isEn: locale === 'en',
  }
}
