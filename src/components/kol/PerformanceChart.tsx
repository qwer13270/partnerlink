'use client'

import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useTranslations } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentKolLinks, usePerformanceChartData } from '@/hooks/useMockData'
import { useLocale } from '@/hooks/useLocale'
import { CHART_COLORS } from '@/lib/constants'

export default function PerformanceChart() {
  const t = useTranslations('kol.performance')
  const { isZhTW } = useLocale()
  const { data, isLoading } = usePerformanceChartData()
  const { data: links } = useCurrentKolLinks()
  const [selectedProject, setSelectedProject] = useState('all')

  const projectOptions = useMemo(() => {
    if (!links) return []
    return links.map((link) => ({
      id: link.propertyId,
      label: isZhTW ? link.propertyName : link.propertyNameEn,
    }))
  }, [links, isZhTW])

  const chartData = useMemo(() => {
    if (!data) return []
    return data
  }, [data])

  if (isLoading || !data) {
    return <Skeleton className="h-[360px] w-full" />
  }

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-lg font-serif">{t('clicksVsBookings')}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">{t('title')}</p>
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder={t('selectProject')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allProjects')}</SelectItem>
            {projectOptions.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="clicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="bookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
              <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke={CHART_COLORS.primary}
                fill="url(#clicks)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke={CHART_COLORS.secondary}
                fill="url(#bookings)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
