'use client'

import { useMemo } from 'react'
import { Clock, MousePointerClick, CalendarCheck, CheckCircle2, BadgeDollarSign } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCurrentKolActivities } from '@/hooks/useMockData'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/hooks/useLocale'
import type { Activity as ActivityType } from '@/lib/types'

const typeIcons = {
  click: MousePointerClick,
  booking: CalendarCheck,
  'tour-completed': CheckCircle2,
  'sale-confirmed': CheckCircle2,
  'commission-paid': BadgeDollarSign,
}

function formatRelativeTime(dateString: string, locale: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffMinutes = Math.round(diffMs / (1000 * 60))

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute')
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffHours / 24)
  return rtf.format(diffDays, 'day')
}

export default function ActivityFeed() {
  const t = useTranslations('kol.activity')
  const { locale, isZhTW } = useLocale()
  const { data, isLoading } = useCurrentKolActivities()

  const items = useMemo(() => (data ? data.slice(0, 5) : []), [data])

  if (isLoading || !data) {
    return <Skeleton className="h-[260px] w-full" />
  }

  return (
    <div className="border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif">{t('title')}</h3>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-6 space-y-4 sm:space-y-5">
        {items.map((activity: ActivityType) => {
          const Icon = typeIcons[activity.type]
          const message = isZhTW ? activity.message : activity.messageEn
          return (
            <div key={activity.id} className="flex gap-3 sm:gap-4 items-start">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-border bg-muted/40 flex items-center justify-center">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground leading-relaxed break-words">{message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatRelativeTime(activity.timestamp, locale)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
