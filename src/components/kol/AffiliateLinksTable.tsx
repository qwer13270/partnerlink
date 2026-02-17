'use client'

import { useMemo, useState } from 'react'
import { Copy, ArrowUpRight, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentKolLinks } from '@/hooks/useMockData'
import { useLocale } from '@/hooks/useLocale'
import { COMMISSION_STATUS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { AffiliateLink } from '@/lib/types'

interface AffiliateLinksTableProps {
  limit?: number
  showSearch?: boolean
  showViewAll?: boolean
}

export default function AffiliateLinksTable({
  limit,
  showSearch = false,
  showViewAll = false,
}: AffiliateLinksTableProps) {
  const t = useTranslations('kol.links')
  const tCommon = useTranslations('common')
  const tStatus = useTranslations('kol.commissions.status')
  const { locale, isZhTW } = useLocale()
  const { data, isLoading } = useCurrentKolLinks()
  const [query, setQuery] = useState('')

  const links = useMemo(() => {
    if (!data) return []
    const normalized = query.trim().toLowerCase()
    const filtered = normalized
      ? data.filter((link) =>
          link.propertyName.toLowerCase().includes(normalized) ||
          link.propertyNameEn.toLowerCase().includes(normalized) ||
          link.link.toLowerCase().includes(normalized)
        )
      : data
    return limit ? filtered.slice(0, limit) : filtered
  }, [data, query, limit])

  const handleCopy = async (link: AffiliateLink) => {
    try {
      await navigator.clipboard.writeText(link.link)
      toast.success(tCommon('copied'))
    } catch {
      toast.error(tCommon('error'))
    }
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {(showSearch || showViewAll) && (
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          {showSearch ? (
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('searchPlaceholder')}
                className="pl-10"
              />
            </div>
          ) : (
            <div />
          )}
          {showViewAll && (
            <a
              href={`/${locale}/kol/links`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {t('viewAllLinks')}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      )}

      <div className="border border-border bg-card overflow-hidden">
        <div className="md:hidden divide-y divide-border">
          {links.map((link) => (
            <div key={link.id} className="p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="font-medium leading-snug">
                    {isZhTW ? link.propertyName : link.propertyNameEn}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {link.isActive ? t('active') : t('paused')}
                  </Badge>
                </div>
                <Badge
                  variant="outline"
                  className={cn('text-xs h-fit', COMMISSION_STATUS_COLORS[link.commissionStatus])}
                >
                  {tStatus(link.commissionStatus)}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground break-all">
                  {link.link}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  onClick={() => handleCopy(link)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="border border-border bg-muted/20 py-3">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{t('clicks')}</p>
                  <p className="text-sm font-medium mt-1">{link.clicks}</p>
                </div>
                <div className="border border-border bg-muted/20 py-3">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{t('bookings')}</p>
                  <p className="text-sm font-medium mt-1">{link.bookings}</p>
                </div>
                <div className="border border-border bg-muted/20 py-3">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{t('sales')}</p>
                  <p className="text-sm font-medium mt-1">{link.confirmedSales}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('project')}</TableHead>
                <TableHead>{t('link')}</TableHead>
                <TableHead className="text-right">{t('clicks')}</TableHead>
                <TableHead className="text-right">{t('bookings')}</TableHead>
                <TableHead className="text-right">{t('sales')}</TableHead>
                <TableHead>{t('commissionStatus')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {isZhTW ? link.propertyName : link.propertyNameEn}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {link.isActive ? t('active') : t('paused')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground truncate max-w-[220px]">
                        {link.link}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleCopy(link)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{link.clicks}</TableCell>
                  <TableCell className="text-right font-medium">{link.bookings}</TableCell>
                  <TableCell className="text-right font-medium">{link.confirmedSales}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', COMMISSION_STATUS_COLORS[link.commissionStatus])}
                    >
                      {tStatus(link.commissionStatus)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
