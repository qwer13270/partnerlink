'use client'

import { Field, Input, Textarea } from '../_ui'
import type { PanelProps } from '../_types'

export function ContactPanel({ project, onFieldChange }: PanelProps) {
  return (
    <div className="space-y-5">
      <Field label="聯絡區塊標題">
        <Input value={project.contactTitle} onChange={(e) => onFieldChange('contactTitle', e.target.value)} />
      </Field>
      <Field label="聯絡區塊內文">
        <Textarea rows={3} value={project.contactBody} onChange={(e) => onFieldChange('contactBody', e.target.value)} />
      </Field>
      <Field label="銷售專線">
        <Input value={project.salesPhone} onChange={(e) => onFieldChange('salesPhone', e.target.value)} />
      </Field>
    </div>
  )
}
