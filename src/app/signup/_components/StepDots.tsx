'use client'

import type { Step } from '../_types'

export function StepDots({ step, total = 2 }: { step: Step; total?: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
        <div
          key={s}
          className={`h-1 rounded-full transition-all duration-300 ${
            s === step
              ? 'w-6 bg-white/80'
              : s < step
              ? 'w-3 bg-white/30'
              : 'w-3 bg-white/15'
          }`}
        />
      ))}
    </div>
  )
}
