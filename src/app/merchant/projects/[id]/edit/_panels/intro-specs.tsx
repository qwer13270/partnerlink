'use client'

import { Field, Input, Textarea, Divider, RepeatableFields } from '../_ui'
import type { PanelProps } from '../_types'

export function IntroSpecsPanel({ project, onFieldChange, onContentItemChange }: PanelProps) {
  return (
    <div className="space-y-5">
      <Field label="建案介紹標題">
        <Input value={project.overviewTitle} onChange={(e) => onFieldChange('overviewTitle', e.target.value)} />
      </Field>
      <Field label="建案介紹內文">
        <Textarea rows={4} value={project.overviewBody} onChange={(e) => onFieldChange('overviewBody', e.target.value)} />
      </Field>
      <Divider label="規格列表" />
      <RepeatableFields
        items={project.contentItems}
        groupKey="intro_specs"
        onContentItemChange={onContentItemChange}
        fieldLabels={{ title: '規格標題', body: '規格內容' }}
      />
    </div>
  )
}
