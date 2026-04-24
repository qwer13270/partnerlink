'use client'

import { useMemo, useState } from 'react'
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
  if (filter === 'all')       return activities
  if (filter === 'sales')     return activities.filter((item) => item.type === 'sale-confirmed')
  if (filter === 'bookings')  return activities.filter((item) => item.type === 'booking')
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
    return <div className="liquid-glass !rounded-[22px] h-[240px] animate-pulse" />
  }

  return (
    <div className="liquid-glass !rounded-[22px] p-6">
      <h3 className="font-heading italic text-[22px] text-white">{t.title}</h3>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`meta text-[10px] px-3 py-1.5 rounded-full border transition-colors ${
              filter === item.value
                ? 'border-white bg-white text-black'
                : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {items.map((activity) => (
          <div key={activity.id} className="flex items-start justify-between gap-4 border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
            <div>
              <p className="text-[13px] text-white/85 leading-relaxed">
                {isZhTW ? activity.message : activity.messageEn}
              </p>
              <p className="meta text-[10px] text-white/45 mt-2">{activity.timestamp}</p>
            </div>
            <div className="meta text-[10px] text-white/40">
              {activity.type.replace('-', ' ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
