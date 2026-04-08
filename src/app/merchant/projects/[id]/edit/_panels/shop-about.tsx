'use client'

import { Field, Input, Textarea } from '../_ui'
import type { PanelProps } from '../_types'

export function ShopAboutPanel({ project, onFieldChange }: PanelProps) {
  return (
    <div className="space-y-5">
      <Field label="標題">
        <Input value={project.overviewTitle} onChange={(e) => onFieldChange('overviewTitle', e.target.value)} />
      </Field>
      <Field label="品牌故事內文">
        <Textarea rows={6} value={project.overviewBody} onChange={(e) => onFieldChange('overviewBody', e.target.value)} />
      </Field>
    </div>
  )
}
