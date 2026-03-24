'use client'

import { Field, Input, Divider, RepeatableFields } from '../_ui'
import { ImageSlotGrid } from './_image-slots'
import type { PanelProps } from '../_types'

export function ProgressPanel({
  project,
  uploadingSlot,
  fallbackImages,
  onFieldChange,
  onContentItemChange,
  onImageUpload,
}: PanelProps) {
  return (
    <div className="space-y-5">
      <Field label="工程進度標題">
        <Input value={project.progressTitle} onChange={(e) => onFieldChange('progressTitle', e.target.value)} />
      </Field>
      <Field label="右側完工文字">
        <Input value={project.progressCompletionText} onChange={(e) => onFieldChange('progressCompletionText', e.target.value)} />
      </Field>
      <Divider label="時程節點" />
      <RepeatableFields
        items={project.contentItems}
        groupKey="timeline_items"
        onContentItemChange={onContentItemChange}
        fieldLabels={{ title: '節點名稱', meta: '日期', body: '描述', state: '狀態' }}
      />
      <Divider label="節點圖片" />
      <ImageSlotGrid
        slots={['timeline_1', 'timeline_2', 'timeline_3', 'timeline_4', 'timeline_5', 'timeline_6']}
        images={project.images}
        fallbackImages={fallbackImages}
        uploadingSlot={uploadingSlot}
        onImageUpload={onImageUpload}
      />
    </div>
  )
}
