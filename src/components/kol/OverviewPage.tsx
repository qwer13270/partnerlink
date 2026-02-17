'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentKol } from '@/hooks/useMockData'
import { useLocale } from '@/hooks/useLocale'
import { TIER_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import StatsCards from '@/components/kol/StatsCards'
import AffiliateLinksTable from '@/components/kol/AffiliateLinksTable'
import PerformanceChart from '@/components/kol/PerformanceChart'
import ActivityFeed from '@/components/kol/ActivityFeed'

export default function OverviewPage() {
  const t = useTranslations('kol')
  const tOverview = useTranslations('kol.overview')
  const { isZhTW } = useLocale()
  const { data: kol, isLoading } = useCurrentKol()

  if (isLoading || !kol) {
    return <Skeleton className="h-[420px] w-full" />
  }

  const displayName = isZhTW ? kol.name : kol.nameEn

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {tOverview('summary')}
          </p>
          <h1 className="text-3xl md:text-4xl font-serif mt-3">
            {t('welcome')}，{displayName}
          </h1>
          <p className="text-sm text-muted-foreground mt-3">
            {t('memberSince')} {kol.joinedDate}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn('text-xs uppercase tracking-widest px-4 py-2', TIER_COLORS[kol.tier])}
        >
          {t(`tier.${kol.tier}`)}
        </Badge>
      </div>

      <StatsCards />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-serif">{tOverview('quickLinks')}</h2>
            <p className="text-sm text-muted-foreground mt-2">{t('links.title')}</p>
          </div>
          <AffiliateLinksTable limit={3} showViewAll showSearch={false} />
        </div>
        <ActivityFeed />
      </div>

      <div>
        <h2 className="text-2xl font-serif mb-4">{tOverview('performance')}</h2>
        <PerformanceChart />
      </div>
    </div>
  )
}
