'use client'

import { Building2, MousePointerClick, CalendarCheck, BadgeDollarSign, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCurrentKolStats } from '@/hooks/useMockData'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/lib/utils'

const statIcons = {
  activeProjects: Building2,
  totalClicks: MousePointerClick,
  totalBookings: CalendarCheck,
  totalCommission: BadgeDollarSign,
}

export default function StatsCards() {
  const t = useTranslations('kol.stats')
  const tCommon = useTranslations('common')
  const { locale } = useLocale()
  const { data, isLoading } = useCurrentKolStats()

  const formatNumber = (value: number) => new Intl.NumberFormat(locale).format(value)

  if (isLoading || !data) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  const stats = [
    {
      key: 'activeProjects',
      label: t('activeProjects'),
      value: formatNumber(data.activeProjects),
      trend: null,
    },
    {
      key: 'totalClicks',
      label: t('totalClicks'),
      value: formatNumber(data.totalClicks),
      trend: data.clicksTrend,
    },
    {
      key: 'totalBookings',
      label: t('bookings'),
      value: formatNumber(data.totalBookings),
      trend: data.bookingsTrend,
    },
    {
      key: 'totalCommission',
      label: t('commission'),
      value: tCommon('tbd'),
      trend: null,
    },
  ] as const

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = statIcons[stat.key]
        return (
          <div key={stat.key} className="stat-card relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {stat.label}
              </span>
              <div className="h-10 w-10 rounded-full border border-border bg-muted/40 flex items-center justify-center">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="mt-6 stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            {typeof stat.trend === 'number' && (
              <div className={cn('stat-trend flex items-center gap-2', stat.trend >= 0 ? 'stat-trend-up' : 'stat-trend-down')}>
                <TrendingUp className={cn('h-3.5 w-3.5', stat.trend < 0 && 'rotate-180')} />
                <span>{stat.trend >= 0 ? '+' : ''}{stat.trend.toFixed(1)}%</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
