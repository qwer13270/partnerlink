'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@/components/ui/skeleton'
import { useProperties, useReferrals, useMerchantInfo } from '@/hooks/useMockData'
import { useLocale } from '@/hooks/useLocale'

export default function ProjectPerformanceCards() {
  const t = useTranslations('merchant.projects')
  const { isZhTW } = useLocale()
  const { data: properties, isLoading } = useProperties()
  const { data: referrals } = useReferrals()
  const { data: merchant } = useMerchantInfo()

  const rows = useMemo(() => {
    if (!properties || !merchant) return []
    return properties
      .filter((property) => property.merchant === merchant.name)
      .map((property) => {
        const propertyReferrals = referrals?.filter((ref) => ref.propertyId === property.id) ?? []
        const bookings = propertyReferrals.filter((ref) => ref.status !== 'cancelled').length
        const tours = propertyReferrals.filter((ref) => ref.status === 'toured' || ref.status === 'sale-confirmed').length
        const sales = propertyReferrals.filter((ref) => ref.status === 'sale-confirmed').length

        return {
          id: property.id,
          name: isZhTW ? property.name : property.nameEn,
          referrals: propertyReferrals.length,
          bookings,
          tours,
          sales,
        }
      })
  }, [properties, referrals, merchant, isZhTW])

  if (isLoading || !properties) {
    return <Skeleton className="h-[240px] w-full" />
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {rows.map((row) => (
        <div key={row.id} className="border border-border bg-card p-6 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t('cardLabel')}</p>
            <h3 className="text-xl font-serif mt-3">{row.name}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: t('referrals'), value: row.referrals },
              { label: t('bookings'), value: row.bookings },
              { label: t('tours'), value: row.tours },
              { label: t('sales'), value: row.sales },
            ].map((item) => (
              <div key={item.label} className="border border-border bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-serif mt-2">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
