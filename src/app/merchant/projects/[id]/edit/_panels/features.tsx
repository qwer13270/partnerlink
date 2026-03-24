'use client'

import { Field, Input, Divider, RepeatableFields } from '../_ui'
import type { PanelProps } from '../_types'

export function FeaturesPanel({ project, onFieldChange, onContentItemChange }: PanelProps) {
  return (
    <div className="space-y-5">
      <Field label="特色亮點標題">
        <Input value={project.featuresTitle} onChange={(e) => onFieldChange('featuresTitle', e.target.value)} />
      </Field>
      <Divider label="亮點卡片" />
      <RepeatableFields
        items={project.contentItems}
        groupKey="feature_cards"
        onContentItemChange={onContentItemChange}
        fieldLabels={{ accent: '編號', title: '標題', body: '內容' }}
      />
    </div>
  )
}
