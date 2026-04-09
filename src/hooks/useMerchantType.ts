'use client'

import { useEffect, useState } from 'react'
import type { MerchantType } from '@/lib/merchant-application'

const CACHE_KEY = 'merchant-type'

function readCache(): MerchantType | null {
  try {
    const v = localStorage.getItem(CACHE_KEY)
    return v === 'shop' ? 'shop' : v === 'property' ? 'property' : null
  } catch { return null }
}

/**
 * Fetches the current merchant's type (建案 | 商案) from their profile.
 * Initialises from localStorage cache to avoid flash on subsequent visits.
 * Returns null only on the very first ever load before the API responds.
 */
export function useMerchantType(): MerchantType | null {
  const [merchantType, setMerchantType] = useState<MerchantType | null>(readCache)

  useEffect(() => {
    let alive = true
    fetch('/api/merchant/profile', { cache: 'no-store' })
      .then(r => r.json())
      .then((d: { profile?: { merchant_type?: string } }) => {
        if (!alive) return
        const mt = d.profile?.merchant_type
        // Default to 'property' for legacy merchants whose type was not set at signup
        const resolved: MerchantType = mt === 'shop' ? 'shop' : 'property'
        try { localStorage.setItem(CACHE_KEY, resolved) } catch { /* ignore */ }
        setMerchantType(resolved)
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  return merchantType
}
