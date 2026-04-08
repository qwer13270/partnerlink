'use client'

import { useEffect, useState } from 'react'
import type { MerchantType } from '@/lib/merchant-application'

/**
 * Fetches the current merchant's type (建案 | 商案) from their profile.
 * Returns null while loading.
 */
export function useMerchantType(): MerchantType | null {
  const [merchantType, setMerchantType] = useState<MerchantType | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/merchant/profile', { cache: 'no-store' })
      .then(r => r.json())
      .then((d: { profile?: { merchant_type?: string } }) => {
        if (!alive) return
        const mt = d.profile?.merchant_type
        // Default to 'property' for legacy merchants whose type was not set at signup
        setMerchantType(mt === 'shop' ? 'shop' : 'property')
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  return merchantType
}
