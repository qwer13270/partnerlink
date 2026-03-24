'use client'

import { Field, Input, Textarea, Divider } from '../_ui'
import { ImageModuleSlot } from './_image-slots'
import type { PanelProps } from '../_types'

export function TeamPanel({
  project,
  module,
  uploadingSlot,
  onContentItemChange,
  onModuleChange,
  onImageUpload,
  onImageDelete,
}: PanelProps) {
  const memberCount = (module.settings.teamMemberCount ?? 4) as 4 | 5

  const teamEntries = project.contentItems
    .map((item, originalIndex) => ({ item, originalIndex }))
    .filter(({ item }) => item.groupKey === 'team_members')
    .sort((a, b) => a.item.sortOrder - b.item.sortOrder)

  return (
    <div className="space-y-5">
      <Field label="模塊標題">
        <Input
          value={module.settings.title ?? '團隊介紹'}
          onChange={(e) =>
            onModuleChange(module.id, (m) => ({
              ...m,
              settings: { ...m.settings, title: e.target.value },
            }))
          }
        />
      </Field>

      <Field label="顯示人數">
        <div className="flex gap-2">
          {([4, 5] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() =>
                onModuleChange(module.id, (m) => ({
                  ...m,
                  settings: { ...m.settings, teamMemberCount: n },
                }))
              }
              className={`flex-1 rounded-md border py-1.5 text-[0.72rem] font-medium transition-colors duration-150 ${
                memberCount === n
                  ? 'border-foreground/40 bg-foreground/10 text-foreground'
                  : 'border-foreground/10 bg-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground'
              }`}
            >
              {n} 人
            </button>
          ))}
        </div>
      </Field>

      {Array.from({ length: memberCount }, (_, index) => {
        const entry = teamEntries[index]
        const sectionKey = `team_member_${index + 1}`
        const image = project.images.find((img) => img.sectionKey === sectionKey)

        return (
          <div key={index} className="space-y-3">
            <Divider label={`成員 ${index + 1}`} />

            <ImageModuleSlot
              label="人物照片"
              sectionKey={sectionKey}
              image={image}
              uploadingSlot={uploadingSlot}
              onImageUpload={onImageUpload}
              onImageDelete={onImageDelete}
            />

            {entry && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="姓名">
                    <Input
                      value={entry.item.title ?? ''}
                      onChange={(e) => onContentItemChange(entry.originalIndex, 'title', e.target.value)}
                    />
                  </Field>
                  <Field label="職稱">
                    <Input
                      value={entry.item.meta ?? ''}
                      onChange={(e) => onContentItemChange(entry.originalIndex, 'meta', e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="簡介">
                  <Textarea
                    rows={3}
                    value={entry.item.body ?? ''}
                    onChange={(e) => onContentItemChange(entry.originalIndex, 'body', e.target.value)}
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
