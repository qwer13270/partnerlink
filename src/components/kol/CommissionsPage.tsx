'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { BadgeDollarSign, Hourglass, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useKolReferrals } from '@/hooks/useMockData'
import { cn } from '@/lib/utils'
import CommissionTable from '@/components/kol/CommissionTable'

const CURRENT_KOL_ID = 'kol-001'

export default function CommissionsPage() {
  const t = useTranslations('kol.commissions')
  const tCommon = useTranslations('common')
  const { data } = useKolReferrals(CURRENT_KOL_ID)

  const summary = useMemo(() => {
    if (!data) {
      return { total: tCommon('tbd'), pending: tCommon('tbd'), paid: tCommon('tbd') }
    }
    return { total: tCommon('tbd'), pending: tCommon('tbd'), paid: tCommon('tbd') }
  }, [data, tCommon])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t('notice')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { key: 'total', icon: BadgeDollarSign, value: summary.total },
          { key: 'pending', icon: Hourglass, value: summary.pending },
          { key: 'paid', icon: CheckCircle2, value: summary.paid },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.key} className="stat-card">
              <div className="flex items-center justify-between">
                <span className="stat-label">{t(`summary.${item.key}`)}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className={cn('stat-value mt-4')}>{item.value}</div>
            </Card>
          )
        })}
      </div>

      <CommissionTable />
    </div>
  )
}
