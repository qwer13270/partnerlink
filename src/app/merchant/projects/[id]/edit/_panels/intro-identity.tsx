'use client'

import { Field, Input, Divider, RepeatableFields } from '../_ui'
import type { PanelProps } from '../_types'

export function IntroIdentityPanel({ project, onFieldChange, onContentItemChange }: PanelProps) {
  return (
    <div className="space-y-5">
      <Field label="完工標籤">
        <Input value={project.completionBadge ?? ''} onChange={(e) => onFieldChange('completionBadge', e.target.value)} />
      </Field>
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
