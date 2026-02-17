'use client'

import { useTranslations } from 'next-intl'
import AffiliateLinksTable from '@/components/kol/AffiliateLinksTable'

export default function LinksPage() {
  const t = useTranslations('kol.links')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {t('subtitle')}
        </p>
      </div>
      <AffiliateLinksTable showSearch />
    </div>
  )
}
