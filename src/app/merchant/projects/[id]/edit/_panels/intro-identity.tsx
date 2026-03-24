'use client'

import { Field, Input, Divider, RepeatableFields } from '../_ui'
import type { PanelProps } from '../_types'

export function IntroIdentityPanel({ project, onFieldChange, onContentItemChange }: PanelProps) {
  return (
    <div className="space-y-5">
      <Field label="商案名稱">
        <Input value={project.name ?? ''} onChange={(e) => onFieldChange('name', e.target.value)} />
      </Field>
      <Field label="副標題">
        <Input value={project.subtitle ?? ''} onChange={(e) => onFieldChange('subtitle', e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="區域標籤">
          <Input value={project.districtLabel ?? ''} onChange={(e) => onFieldChange('districtLabel', e.target.value)} />
        </Field>
        <Field label="完工標籤">
          <Input value={project.completionBadge ?? ''} onChange={(e) => onFieldChange('completionBadge', e.target.value)} />
        </Field>
      </div>
      <Divider label="識別條帶" />
      <RepeatableFields
        items={project.contentItems}
        groupKey="identity_specs"
        onContentItemChange={onContentItemChange}
        fieldLabels={{ title: '標題', body: '內容' }}
      />
    </div>
  )
}
