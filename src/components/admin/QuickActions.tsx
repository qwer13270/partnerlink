'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export default function QuickActions() {
  const t = useTranslations('admin.quickActions')

  return (
    <div className="border border-border bg-card p-6">
      <h3 className="text-lg font-serif">{t('title')}</h3>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="outline">{t('addProject')}</Button>
        <Button variant="outline">{t('inviteKol')}</Button>
        <Button>{t('exportReports')}</Button>
      </div>
    </div>
  )
}
