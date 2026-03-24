'use client'

import { Field, Input, Divider } from '../_ui'
import { ImageModuleSlot } from './_image-slots'
import type { PanelProps } from '../_types'

const UNIT_KEYS = ['a', 'b', 'c', 'd'] as const

export function FloorPlanPanel({
  project,
  module,
  uploadingSlot,
  onContentItemChange,
  onModuleChange,
  onImageUpload,
  onImageDelete,
}: PanelProps) {
  const unitCount = (module.settings.floorPlanUnitCount ?? 4) as 3 | 4 | 5

  // Build a map of { item, originalIndex } sorted by sortOrder
  const floorPlanEntries = project.contentItems
    .map((item, originalIndex) => ({ item, originalIndex }))
    .filter(({ item }) => item.groupKey === 'floor_plan_units')
    .sort((a, b) => a.item.sortOrder - b.item.sortOrder)

  function setUnitCount(count: 3 | 4 | 5) {
    onModuleChange(module.id, (m) => ({
      ...m,
      settings: { ...m.settings, floorPlanUnitCount: count },
    }))
  }

  return (
    <div className="space-y-5">
      <Field label="模塊標題">
        <Input
          value={module.settings.title ?? '格局規劃'}
          onChange={(e) =>
            onModuleChange(module.id, (m) => ({
              ...m,
              settings: { ...m.settings, title: e.target.value },
            }))
          }
        />
      </Field>

      <Field label="顯示戶型數">
        <div className="flex gap-2">
          {([3, 4, 5] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setUnitCount(n)}
              className={`flex-1 rounded-md border py-1.5 text-[0.72rem] font-medium transition-colors duration-150 ${
                unitCount === n
                  ? 'border-foreground/40 bg-foreground/10 text-foreground'
                  : 'border-foreground/10 bg-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground'
              }`}
            >
              {n} 型
            </button>
          ))}
        </div>
      </Field>

      {UNIT_KEYS.slice(0, unitCount).map((unitKey, index) => {
        const entry = floorPlanEntries[index]
        const sectionKey = `floor_plan_unit_${unitKey}`
        const image = project.images.find((img) => img.sectionKey === sectionKey)

        return (
          <div key={unitKey} className="space-y-3">
            <Divider label={`${String.fromCharCode(65 + index)} 型`} />

            <ImageModuleSlot
              label="戶型圖"
              sectionKey={sectionKey}
              image={image}
              uploadingSlot={uploadingSlot}
              onImageUpload={onImageUpload}
              onImageDelete={onImageDelete}
            />

            {entry && (
              <div className="grid grid-cols-2 gap-2">
                <Field label="戶型名稱">
                  <Input
                    value={entry.item.title ?? ''}
                    onChange={(e) => onContentItemChange(entry.originalIndex, 'title', e.target.value)}
                  />
                </Field>
                <Field label="格局配置">
                  <Input
                    value={entry.item.body ?? ''}
                    onChange={(e) => onContentItemChange(entry.originalIndex, 'body', e.target.value)}
                  />
                </Field>
                <Field label="坪數">
                  <Input
                    value={entry.item.meta ?? ''}
                    onChange={(e) => onContentItemChange(entry.originalIndex, 'meta', e.target.value)}
                  />
                </Field>
                <Field label="價格">
                  <Input
                    value={entry.item.accent ?? ''}
                    onChange={(e) => onContentItemChange(entry.originalIndex, 'accent', e.target.value)}
                  />
                </Field>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
