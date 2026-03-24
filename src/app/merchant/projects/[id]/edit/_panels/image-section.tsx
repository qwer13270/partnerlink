'use client'

import { getImageSectionSlotKey } from '@/lib/property-template'
import { ImageModuleSlot } from './_image-slots'
import type { PanelProps } from '../_types'

export function ImageSectionPanel({
  project,
  module,
  uploadingSlot,
  onModuleChange,
  onImageUpload,
  onImageDelete,
}: PanelProps) {
  const desktopKey   = module.settings.primaryImageSectionKey   ?? getImageSectionSlotKey(module.id, 'primary')
  const mobileKey    = module.settings.secondaryImageSectionKey ?? getImageSectionSlotKey(module.id, 'secondary')
  const desktopImage = project.images.find((img) => img.sectionKey === desktopKey)
  const mobileImage  = project.images.find((img) => img.sectionKey === mobileKey)

  function ensureSlotKeys() {
    onModuleChange(module.id, (m) => ({
      ...m,
      settings: {
        ...m.settings,
        primaryImageSectionKey:   desktopKey,
        secondaryImageSectionKey: mobileKey,
      },
    }))
  }

  async function uploadWithKeys(sectionKey: string, file: File | null) {
    ensureSlotKeys()
    return onImageUpload(sectionKey, file)
  }

  return (
    <div className="space-y-5">
      <ImageModuleSlot
        label="桌機版圖片"
        sectionKey={desktopKey}
        image={desktopImage}
        uploadingSlot={uploadingSlot}
        onImageUpload={uploadWithKeys}
        onImageDelete={onImageDelete}
      />
      <ImageModuleSlot
        label="手機版圖片"
        sectionKey={mobileKey}
        image={mobileImage}
        uploadingSlot={uploadingSlot}
        onImageUpload={uploadWithKeys}
        onImageDelete={onImageDelete}
      />
    </div>
  )
}
