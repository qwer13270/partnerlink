'use client'

import { Field, Input, Divider, RepeatableFields } from '../_ui'
import type { PanelProps } from '../_types'

export function ShopFaqPanel({ project, module, onModuleChange, onContentItemChange }: PanelProps) {
  return (
    <div className="space-y-5">
      <Field label="區塊標題">
        <Input
          value={module.settings.title ?? ''}
          onChange={(e) => onModuleChange(module.id, (m) => ({ ...m, settings: { ...m.settings, title: e.target.value } }))}
          placeholder="常見問題"
        />
      </Field>
      <Divider label="問答項目" />
      <RepeatableFields
        items={project.contentItems}
        groupKey="shop_faq"
        onContentItemChange={onContentItemChange}
        fieldLabels={{ title: '問題', body: '回答' }}
      />
    </div>
  )
}
