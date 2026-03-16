'use client'

import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useActivities } from '@/hooks/useMockData'
import { useLocale } from '@/hooks/useLocale'
import type { Activity } from '@/lib/types'
import strings from '@/lib/strings'

const t = strings.admin.activity

const FILTERS = [
  { value: 'all',       label: t.all       },
  { value: 'referrals', label: t.referrals },
  { value: 'bookings',  label: t.bookings  },
  { value: 'sales',     label: t.sales     },
]

function filterActivities(activities: Activity[], filter: string) {
  if (filter === 'all')      return activities
  if (filter === 'sales')    return activities.filter((item) => item.type === 'sale-confirmed')
  if (filter === 'bookings') return activities.filter((item) => item.type === 'booking')
  if (filter === 'referrals') return activities.filter((item) => item.type === 'click')
  return activities
}

export default function ActivityLog() {
  const { isZhTW } = useLocale()
  const { data, isLoading } = useActivities()
  const [filter, setFilter] = useState('all')

  const items = useMemo(() => {
    if (!data) return []
    return filterActivities(data.slice(0, 8), filter)
  }, [data, filter])

  if (isLoading || !data) {
    return <Skeleton className="h-[240px] w-full" />
  }

  return (
    <div className="border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif">{t.title}</h3>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mt-4">
        <TabsList>
          {FILTERS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={filter} className="mt-6">
          <div className="space-y-4">
            {items.map((activity) => (
              <div key={activity.id} className="flex items-start justify-between gap-4 border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
                <div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {isZhTW ? activity.message : activity.messageEn}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">{activity.timestamp}</p>
                </div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {activity.type.replace('-', ' ')}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
