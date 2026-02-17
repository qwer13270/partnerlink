'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCurrentKolLinks, usePerformanceChartData } from '@/hooks/useMockData'
import { useLocale } from '@/hooks/useLocale'
import PerformanceChart from '@/components/kol/PerformanceChart'
import { cn } from '@/lib/utils'

const dateRangeOptions = ['last7', 'last30', 'last90'] as const

export default function PerformancePage() {
  const t = useTranslations('kol.performance')
  const { isZhTW } = useLocale()
  const { data: links } = useCurrentKolLinks()
  const { data: chartData } = usePerformanceChartData()

  const breakdown = useMemo(() => {
    if (!links || !chartData) return []
    return links.map((link) => ({
      id: link.id,
      name: isZhTW ? link.propertyName : link.propertyNameEn,
      clicks: link.clicks,
      bookings: link.bookings,
      conversion: link.bookings ? Math.round((link.bookings / link.clicks) * 100) : 0,
    }))
  }, [links, chartData, isZhTW])

  const funnelSteps = [
    { key: 'clicks', value: 1247 },
    { key: 'bookings', value: 38 },
    { key: 'tours', value: 21 },
    { key: 'sales', value: 5 },
  ] as const

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Select defaultValue="last30">
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('dateRange')} />
          </SelectTrigger>
          <SelectContent>
            {dateRangeOptions.map((range) => (
              <SelectItem key={range} value={range}>
                {t(`dateRangeOptions.${range}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PerformanceChart />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-serif">{t('breakdownTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {breakdown.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-4 border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.clicks} {t('funnel.clicks')} · {row.bookings} {t('funnel.bookings')}
                  </p>
                </div>
                <div className={cn('text-sm flex items-center gap-1', row.conversion >= 10 ? 'text-emerald-700' : 'text-amber-700')}>
                  {row.conversion >= 10 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {row.conversion}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-serif">{t('conversionFunnel')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnelSteps.map((step, index) => (
              <div key={step.key} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full border border-border bg-muted/40 flex items-center justify-center text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{t(`funnel.${step.key}`)}</p>
                  <p className="text-2xl font-serif">{step.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
