'use client'

import { Field, Input, Textarea } from '../_ui'
import type { PanelProps } from '../_types'

export function ShopContactPanel({ project, onFieldChange }: PanelProps) {
  return (
    <div className="space-y-5">
      <Field label="聯絡標題">
        <Input value={project.contactTitle} onChange={(e) => onFieldChange('contactTitle', e.target.value)} />
      </Field>
      <Field label="聯絡說明">
        <Textarea rows={3} value={project.contactBody} onChange={(e) => onFieldChange('contactBody', e.target.value)} />
      </Field>
      <Field label="聯絡電話">
        <Input value={project.salesPhone} onChange={(e) => onFieldChange('salesPhone', e.target.value)} placeholder="02-xxxx-xxxx 或 09xx-xxx-xxx" />
      </Field>
    </div>
  )
}
