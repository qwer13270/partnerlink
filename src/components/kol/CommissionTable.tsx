'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useKolReferrals } from '@/hooks/useMockData'
import { useLocale } from '@/hooks/useLocale'
import { COMMISSION_STATUS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Referral } from '@/lib/types'

const CURRENT_KOL_ID = 'kol-001'

const statusMap: Record<Referral['status'], 'pending' | 'confirmed'> = {
  'pending-tour': 'pending',
  toured: 'pending',
  negotiating: 'pending',
  'sale-confirmed': 'confirmed',
  cancelled: 'pending',
}

export default function CommissionTable() {
  const t = useTranslations('kol.commissions')
  const tCommon = useTranslations('common')
  const { locale } = useLocale()
  const { data, isLoading } = useKolReferrals(CURRENT_KOL_ID)

  const rows = useMemo(() => {
    if (!data) return []
    return data
  }, [data])

  if (isLoading || !data) {
    return <Skeleton className="h-[320px] w-full" />
  }

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-serif">{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('notice')}</p>
      </CardHeader>
      <CardContent>
        <div className="border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('saleDate')}</TableHead>
                <TableHead>{t('salePrice')}</TableHead>
                <TableHead>{t('rate')}</TableHead>
                <TableHead>{t('amount')}</TableHead>
                <TableHead>{tCommon('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((referral) => {
                const status = statusMap[referral.status]
                return (
                  <TableRow key={referral.id}>
                    <TableCell className="text-muted-foreground">
                      {referral.tourDate ?? referral.referralDate}
                    </TableCell>
                    <TableCell>
                      {referral.salePrice
                        ? `NT$ ${referral.salePrice.toLocaleString(locale)}萬`
                        : tCommon('tbd')}
                    </TableCell>
                    <TableCell>{tCommon('tbd')}</TableCell>
                    <TableCell>{tCommon('tbd')}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('text-xs', COMMISSION_STATUS_COLORS[status])}
                      >
                        {t(`status.${status}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
