'use client'

import { Field, Textarea } from '../_ui'
import type { PanelProps } from '../_types'

export function ShopFooterPanel({ project, onFieldChange }: PanelProps) {
  return (
    <div className="space-y-5">
      <Field label="版權聲明" hint="顯示在頁面最底部的小字說明">
        <Textarea rows={4} value={project.footerDisclaimer} onChange={(e) => onFieldChange('footerDisclaimer', e.target.value)} />
      </Field>
    </div>
  )
}
