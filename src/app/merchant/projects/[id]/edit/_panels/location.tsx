'use client'

import { Divider, RepeatableFields } from '../_ui'
import type { PanelProps } from '../_types'

export function LocationPanel({ project, onFieldChange, onContentItemChange }: PanelProps) {
  return (
    <div className="space-y-5">
      <Divider label="周邊設施" />
      <RepeatableFields
        items={project.contentItems}
        groupKey="location_points"
        onContentItemChange={onContentItemChange}
        fieldLabels={{ title: '地點', body: '時間 / 距離', accent: '顏色' }}
      />
    </div>
  )
}
