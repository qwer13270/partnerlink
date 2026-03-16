'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useReferrals } from '@/hooks/useMockData'
import { useLocale } from '@/hooks/useLocale'
import { STATUS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Referral } from '@/lib/types'
import strings from '@/lib/strings'

const statusLabels = strings.merchant.leads.status

const statusLabelMap: Record<Referral['status'], keyof typeof statusLabels> = {
  'pending-tour':    'pendingTour',
  toured:            'toured',
  negotiating:       'negotiating',
  'sale-confirmed':  'saleConfirmed',
  cancelled:         'cancelled',
}

export default function ReferralsTable() {
  const { isZhTW } = useLocale()
  const { data, isLoading } = useReferrals()
  const t = strings.admin.referrals

  const rows = useMemo(() => data ?? [], [data])

  if (isLoading || !data) {
    return <Skeleton className="h-[360px] w-full" />
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <Input placeholder={t.searchPlaceholder} />
        </div>
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder={t.filterByStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{strings.common.filter}</SelectItem>
            {Object.keys(statusLabelMap).map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabels[statusLabelMap[status as Referral['status']]]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder={t.filterByProperty} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{strings.common.filter}</SelectItem>
            <SelectItem value="prop-001">光河</SelectItem>
            <SelectItem value="prop-003">國泰禾</SelectItem>
            <SelectItem value="prop-005">潤泰敦峰</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.leadName}</TableHead>
              <TableHead>{t.project}</TableHead>
              <TableHead>{t.kol}</TableHead>
              <TableHead>{strings.common.date}</TableHead>
              <TableHead>{t.tourDate}</TableHead>
              <TableHead>{strings.common.status}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((referral) => (
              <TableRow key={referral.id}>
                <TableCell className="font-medium">{referral.leadName}</TableCell>
                <TableCell>{isZhTW ? referral.propertyName : referral.propertyNameEn}</TableCell>
                <TableCell>{isZhTW ? referral.kolName : referral.kolNameEn}</TableCell>
                <TableCell className="text-muted-foreground">{referral.referralDate}</TableCell>
                <TableCell className="text-muted-foreground">{referral.tourDate ?? '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('text-xs', STATUS_COLORS[referral.status])}>
                    {statusLabels[statusLabelMap[referral.status]]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
