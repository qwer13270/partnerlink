'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useMerchantReferrals } from '@/hooks/useMockData'
import { useLocale } from '@/hooks/useLocale'
import { STATUS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Referral } from '@/lib/types'

const statusLabelMap: Record<Referral['status'], string> = {
  'pending-tour': 'pendingTour',
  toured: 'toured',
  negotiating: 'negotiating',
  'sale-confirmed': 'saleConfirmed',
  cancelled: 'cancelled',
}

export default function LeadsTable() {
  const t = useTranslations('merchant.leads')
  const tStatus = useTranslations('merchant.leads.status')
  const tCommon = useTranslations('common')
  const { isZhTW } = useLocale()
  const { data, isLoading, updateReferralStatus } = useMerchantReferrals()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const rows = useMemo(() => (data ? data : []), [data])

  const selectedLead = rows.find((lead) => lead.id === selectedId) ?? null

  const handleConfirmSale = () => {
    if (!selectedLead) return
    updateReferralStatus(selectedLead.id, 'sale-confirmed')
    toast.success(t('saleConfirmedSuccess'))
    setSelectedId(null)
  }

  if (isLoading || !data) {
    return <Skeleton className="h-[360px] w-full" />
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder={t('filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tCommon('filter')}</SelectItem>
            {Object.keys(statusLabelMap).map((status) => (
              <SelectItem key={status} value={status}>
                {tStatus(statusLabelMap[status as Referral['status']])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder={t('filterByKol')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tCommon('filter')}</SelectItem>
            <SelectItem value="kol-001">Sarah Chen</SelectItem>
            <SelectItem value="kol-003">Lisa Lin</SelectItem>
            <SelectItem value="kol-005">Amy Wu</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder={t('filterByDate')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tCommon('filter')}</SelectItem>
            <SelectItem value="last7">{t('dateRanges.last7')}</SelectItem>
            <SelectItem value="last30">{t('dateRanges.last30')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('leadName')}</TableHead>
              <TableHead>{t('referredBy')}</TableHead>
              <TableHead>{t('referralDate')}</TableHead>
              <TableHead>{t('tourDate')}</TableHead>
              <TableHead>{tCommon('status')}</TableHead>
              <TableHead>{tCommon('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.leadName}</TableCell>
                <TableCell>{isZhTW ? lead.kolName : lead.kolNameEn}</TableCell>
                <TableCell className="text-muted-foreground">{lead.referralDate}</TableCell>
                <TableCell className="text-muted-foreground">{lead.tourDate ?? '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('text-xs', STATUS_COLORS[lead.status])}>
                    {tStatus(statusLabelMap[lead.status])}
                  </Badge>
                </TableCell>
                <TableCell>
                  {lead.status === 'negotiating' ? (
                    <Button size="sm" onClick={() => setSelectedId(lead.id)}>
                      {t('confirmSale')}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmSaleTitle')}</DialogTitle>
            <DialogDescription>{t('confirmSaleDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedId(null)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleConfirmSale}>{tCommon('confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
