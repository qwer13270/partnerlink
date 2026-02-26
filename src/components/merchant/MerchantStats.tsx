'use client'

import { Building2, Users, CalendarCheck, BadgeCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@/components/ui/skeleton'
import { useMerchantStats } from '@/hooks/useMockData'
import { useLocale } from '@/hooks/useLocale'

const iconMap = {
  activeProjects: Building2,
  totalReferrals: Users,
  tourBookings: CalendarCheck,
  confirmedSales: BadgeCheck,
}

export default function MerchantStats() {
  const t = useTranslations('merchant.stats')
  const { locale } = useLocale()
  const { data, isLoading } = useMerchantStats()

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
    { key: 'activeProjects', label: t('activeProjects'), value: data.activeProjects },
    { key: 'totalReferrals', label: t('totalReferrals'), value: data.totalReferrals },
    { key: 'tourBookings', label: t('tourBookings'), value: data.tourBookings },
    { key: 'confirmedSales', label: t('confirmedSales'), value: data.confirmedSales },
  ] as const

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.key]
        return (
          <div key={stat.key} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">{stat.label}</span>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="stat-value mt-4">{new Intl.NumberFormat(locale).format(stat.value)}</div>
          </div>
        )
      })}
    </div>
  )
}
