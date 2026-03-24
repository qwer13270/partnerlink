'use client'

import { Field, Input, Divider, RepeatableFields } from '../_ui'
import type { PanelProps } from '../_types'

export function LocationPanel({ project, onFieldChange, onContentItemChange }: PanelProps) {
  return (
    <div className="space-y-5">
      <Field label="地理位置標題">
        <Input value={project.locationTitle} onChange={(e) => onFieldChange('locationTitle', e.target.value)} />
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label="緯度">
          <Input
            type="number"
            step="0.000001"
            value={String(project.mapLat)}
            onChange={(e) => onFieldChange('mapLat', Number(e.target.value))}
          />
        </Field>
        <Field label="經度">
          <Input
            type="number"
            step="0.000001"
            value={String(project.mapLng)}
            onChange={(e) => onFieldChange('mapLng', Number(e.target.value))}
          />
        </Field>
        <Field label="縮放">
          <Input
            type="number"
            value={String(project.mapZoom)}
            onChange={(e) => onFieldChange('mapZoom', Number(e.target.value))}
          />
        </Field>
      </div>
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
