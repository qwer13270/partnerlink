'use client'

import { TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminStats } from '@/hooks/useMockData'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/lib/utils'
import strings from '@/lib/strings'

export default function OverviewStats() {
  const { locale } = useLocale()
  const { data, isLoading } = useAdminStats()

  const formatNumber = (value: number) => new Intl.NumberFormat(locale).format(value)

  if (isLoading || !data) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  const s = strings.admin.stats
  const stats = [
    { label: s.totalProjects,        value: formatNumber(data.totalProjects),      trend: data.referralsTrend },
    { label: s.activeKols,           value: formatNumber(data.activeKols),          trend: data.bookingsTrend  },
    { label: s.referralsThisMonth,   value: formatNumber(data.referralsThisMonth),  trend: data.referralsTrend },
    { label: s.bookingsThisMonth,    value: formatNumber(data.bookingsThisMonth),   trend: data.bookingsTrend  },
    { label: s.confirmedSales,       value: formatNumber(data.confirmedSales),      trend: 6.4                 },
    { label: s.commissionPayable,    value: strings.common.tbd,                    trend: null                },
  ] as const

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card relative overflow-hidden">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {stat.label}
          </div>
          <div className="stat-value mt-6">{stat.value}</div>
          {typeof stat.trend === 'number' && (
            <div className={cn('stat-trend flex items-center gap-2', stat.trend >= 0 ? 'stat-trend-up' : 'stat-trend-down')}>
              <TrendingUp className={cn('h-3.5 w-3.5', stat.trend < 0 && 'rotate-180')} />
              <span>{stat.trend >= 0 ? '+' : ''}{stat.trend.toFixed(1)}%</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
