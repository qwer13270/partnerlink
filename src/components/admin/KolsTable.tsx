'use client'

import { useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useKols } from '@/hooks/useMockData'
import { useLocale } from '@/hooks/useLocale'
import { TIER_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import strings from '@/lib/strings'

export default function KolsTable() {
  const { isZhTW, locale } = useLocale()
  const { data, isLoading } = useKols()
  const t = strings.admin.kols

  const rows = useMemo(() => {
    if (!data) return []
    return data.map((kol) => ({
      id: kol.id,
      name: isZhTW ? kol.name : kol.nameEn,
      email: kol.email,
      tier: kol.tier,
      activeProjects: kol.activeProjects,
      totalClicks: kol.totalClicks,
      totalBookings: kol.totalBookings,
      totalSales: kol.totalSales,
      joinedDate: kol.joinedDate,
    }))
  }, [data, isZhTW])

  if (isLoading || !data) {
    return <Skeleton className="h-[360px] w-full" />
  }

  return (
    <div className="border border-border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{strings.common.name}</TableHead>
            <TableHead>{strings.common.email}</TableHead>
            <TableHead>{t.tier}</TableHead>
            <TableHead className="text-right">{t.activeProjects}</TableHead>
            <TableHead className="text-right">{t.clicks}</TableHead>
            <TableHead className="text-right">{t.bookings}</TableHead>
            <TableHead className="text-right">{t.sales}</TableHead>
            <TableHead>{t.joinedDate}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('text-xs uppercase', TIER_COLORS[row.tier])}>
                  {row.tier}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{row.activeProjects}</TableCell>
              <TableCell className="text-right">{new Intl.NumberFormat(locale).format(row.totalClicks)}</TableCell>
              <TableCell className="text-right">{row.totalBookings}</TableCell>
              <TableCell className="text-right">{row.totalSales}</TableCell>
              <TableCell className="text-muted-foreground">{row.joinedDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
