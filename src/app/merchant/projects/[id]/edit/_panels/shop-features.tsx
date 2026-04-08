'use client'

import { Field, Input, Divider, RepeatableFields } from '../_ui'
import type { PanelProps } from '../_types'

export function ShopFeaturesPanel({ project, module, onModuleChange, onContentItemChange }: PanelProps) {
  return (
    <div className="space-y-5">
      <Field label="區塊標題">
        <Input
          value={module.settings.title ?? ''}
          onChange={(e) => onModuleChange(module.id, (m) => ({ ...m, settings: { ...m.settings, title: e.target.value } }))}
          placeholder="品牌特色"
        />
      </Field>
      <Divider label="特色項目" />
      <RepeatableFields
        items={project.contentItems}
        groupKey="shop_features"
        onContentItemChange={onContentItemChange}
        fieldLabels={{ title: '標題', body: '說明' }}
      />
    </div>
  )
}
