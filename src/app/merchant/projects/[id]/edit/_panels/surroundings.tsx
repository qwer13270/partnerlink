'use client'

import { Field, Input, Divider } from '../_ui'
import { ImageModuleSlot } from './_image-slots'
import type { PanelProps } from '../_types'

const SURROUNDINGS_SLOTS = [
  'surroundings_1',
  'surroundings_2',
  'surroundings_3',
  'surroundings_4',
  'surroundings_5',
  'surroundings_6',
] as const

const SLOT_LABELS: Record<string, string> = {
  surroundings_1: '主圖（大圖，左側 2/3）',
  surroundings_2: '右側上圖',
  surroundings_3: '右側下圖',
  surroundings_4: '下排左圖',
  surroundings_5: '下排中圖',
  surroundings_6: '下排右圖',
}

export function SurroundingsPanel({
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
          value={module.settings.title ?? '周邊環境'}
          onChange={(e) =>
            onModuleChange(module.id, (m) => ({
              ...m,
              settings: { ...m.settings, title: e.target.value },
            }))
          }
        />
      </Field>

      <Divider label="環境照片（最多 6 張）" />

      <div className="space-y-5">
        {SURROUNDINGS_SLOTS.map((sectionKey) => {
          const image = project.images.find((img) => img.sectionKey === sectionKey)
          const caption = module.settings.captions?.[sectionKey] ?? ''
          return (
            <div key={sectionKey} className="space-y-2">
              <ImageModuleSlot
                label={SLOT_LABELS[sectionKey] ?? sectionKey}
                sectionKey={sectionKey}
                image={image}
                uploadingSlot={uploadingSlot}
                onImageUpload={onImageUpload}
                onImageDelete={onImageDelete}
              />
              <Field label="圖片標題（滑入顯示）">
                <Input
                  value={caption}
                  placeholder="例：捷運忠孝新生站"
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
