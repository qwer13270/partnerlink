'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useProperties, useReferrals } from '@/hooks/useMockData'
import { useLocale } from '@/hooks/useLocale'
import { PROPERTY_STATUS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function ProjectsTable() {
  const t = useTranslations('admin.projects')
  const tCommon = useTranslations('common')
  const tProperty = useTranslations('property')
  const { isZhTW } = useLocale()
  const { data: properties, isLoading } = useProperties()
  const { data: referrals } = useReferrals()

  const rows = useMemo(() => {
    if (!properties) return []
    return properties.map((property) => {
      const propertyReferrals = referrals?.filter((ref) => ref.propertyId === property.id) ?? []
      const bookings = propertyReferrals.filter((ref) => ref.status !== 'cancelled').length
      const sales = propertyReferrals.filter((ref) => ref.status === 'sale-confirmed').length
      const kolAssigned = new Set(propertyReferrals.map((ref) => ref.kolId)).size

      return {
        id: property.id,
        name: isZhTW ? property.name : property.nameEn,
        merchant: isZhTW ? property.merchant : property.merchantEn,
        location: isZhTW ? property.location : property.locationEn,
        status: property.status,
        kolsAssigned: kolAssigned,
        referrals: propertyReferrals.length,
        bookings,
        sales,
      }
    })
  }, [properties, referrals, isZhTW])

  if (isLoading || !properties) {
    return <Skeleton className="h-[360px] w-full" />
  }

  return (
    <div className="border border-border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('title')}</TableHead>
            <TableHead>{t('merchant')}</TableHead>
            <TableHead>{t('location')}</TableHead>
            <TableHead>{tCommon('status')}</TableHead>
            <TableHead className="text-right">{t('kolsAssigned')}</TableHead>
            <TableHead className="text-right">{t('referrals')}</TableHead>
            <TableHead className="text-right">{t('bookings')}</TableHead>
            <TableHead className="text-right">{t('sales')}</TableHead>
            <TableHead>{tCommon('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>{row.merchant}</TableCell>
              <TableCell>{row.location}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn('text-xs capitalize', PROPERTY_STATUS_COLORS[row.status])}
                >
                  {tProperty(
                    row.status === 'pre-sale'
                      ? 'preSale'
                      : row.status === 'selling'
                        ? 'selling'
                        : row.status === 'sold-out'
                          ? 'soldOut'
                          : 'completed'
                  )}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{row.kolsAssigned}</TableCell>
              <TableCell className="text-right">{row.referrals}</TableCell>
              <TableCell className="text-right">{row.bookings}</TableCell>
              <TableCell className="text-right">{row.sales}</TableCell>
              <TableCell>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/zh-TW/properties" className="inline-flex items-center gap-2">
                    {t('viewLandingPage')}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
