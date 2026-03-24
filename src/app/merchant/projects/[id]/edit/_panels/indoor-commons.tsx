'use client'

import { Field, Input, Divider } from '../_ui'
import { ImageModuleSlot } from './_image-slots'
import type { PanelProps } from '../_types'

const INDOOR_SLOTS = [
  'indoor_1', 'indoor_2', 'indoor_3',
  'indoor_4', 'indoor_5', 'indoor_6',
] as const

export function IndoorCommonsPanel({
  project,
  module,
  uploadingSlot,
  onModuleChange,
  onImageUpload,
  onImageDelete,
}: PanelProps) {
  return (
    <div className="space-y-5">
      <Field label="模塊標題">
        <Input
          value={module.settings.title ?? '室內公社'}
          onChange={(e) =>
            onModuleChange(module.id, (m) => ({
              ...m,
              settings: { ...m.settings, title: e.target.value },
            }))
          }
        />
      </Field>

      <Divider label="設施照片（最多 6 張）" />

      <div className="space-y-5">
        {INDOOR_SLOTS.map((sectionKey, index) => {
          const image = project.images.find((img) => img.sectionKey === sectionKey)
          const label = module.settings.captions?.[sectionKey] ?? ''
          return (
            <div key={sectionKey} className="space-y-2">
              <ImageModuleSlot
                label={`設施 ${index + 1}`}
                sectionKey={sectionKey}
                image={image}
                uploadingSlot={uploadingSlot}
                onImageUpload={onImageUpload}
                onImageDelete={onImageDelete}
              />
              <Field label="設施名稱（顯示於圖片上）">
                <Input
                  value={label}
                  placeholder="例：健身房、游泳池、閱覽室"
                  onChange={(e) =>
                    onModuleChange(module.id, (m) => ({
                      ...m,
                      settings: {
                        ...m.settings,
                        captions: { ...m.settings.captions, [sectionKey]: e.target.value },
                      },
                    }))
                  }
                />
              </Field>
            </div>
          )
        })}
      </div>
    </div>
  )
}
