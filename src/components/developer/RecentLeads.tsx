'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useDeveloperReferrals } from '@/hooks/useMockData'
import { useLocale } from '@/hooks/useLocale'
import { STATUS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Referral } from '@/lib/types'

const statusLabelMap: Record<Referral['status'], string> = {
  'pending-tour': 'pendingTour',
  toured: 'toured',
  negotiating: 'negotiating',
  'sale-confirmed': 'saleConfirmed',
  cancelled: 'cancelled',
}

export default function RecentLeads() {
  const t = useTranslations('developer')
  const tLeads = useTranslations('developer.leads.status')
  const { isZhTW } = useLocale()
  const { data, isLoading } = useDeveloperReferrals()

  const rows = useMemo(() => (data ? data.slice(0, 5) : []), [data])

  if (isLoading || !data) {
    return <Skeleton className="h-[220px] w-full" />
  }

  return (
    <div className="border border-border bg-card p-6">
      <h3 className="text-lg font-serif">{t('recentLeads')}</h3>
      <div className="mt-6 space-y-4">
        {rows.map((lead) => (
          <div key={lead.id} className="flex items-center justify-between gap-4 border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
            <div>
              <p className="text-sm font-medium">{lead.leadName}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isZhTW ? lead.propertyName : lead.propertyNameEn}
              </p>
            </div>
            <Badge variant="outline" className={cn('text-xs', STATUS_COLORS[lead.status])}>
              {tLeads(statusLabelMap[lead.status])}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
