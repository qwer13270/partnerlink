'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useKolPerformanceData } from '@/hooks/useMockData'
import { useLocale } from '@/hooks/useLocale'
import { CHART_COLORS } from '@/lib/constants'

export default function KolsPerformance() {
  const t = useTranslations('merchant.kolPerformance')
  const { isZhTW } = useLocale()
  const { data, isLoading } = useKolPerformanceData()

  if (isLoading || !data) {
    return <Skeleton className="h-[360px] w-full" />
  }

  const chartData = data.map((row) => ({
    name: isZhTW ? row.kolName : row.kolNameEn,
    referrals: row.referrals,
    conversion: row.conversionRate,
  }))

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-serif">{t('comparisonChart')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="referrals" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} />
              <Bar dataKey="conversion" fill={CHART_COLORS.secondary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
