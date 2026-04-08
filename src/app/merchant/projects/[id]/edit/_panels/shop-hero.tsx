'use client'

import { Field, Input, Textarea } from '../_ui'
import { ImageModuleSlot } from './_image-slots'
import type { PanelProps } from '../_types'

export function ShopHeroPanel({ project, uploadingSlot, onFieldChange, onImageUpload, onImageDelete }: PanelProps) {
  const heroImage = project.images.find((img) => img.sectionKey === 'shop_hero_image')

  return (
    <div className="space-y-5">
      <Field label="品牌名稱">
        <Input value={project.name} onChange={(e) => onFieldChange('name', e.target.value)} />
      </Field>
      <Field label="品牌標語">
        <Textarea rows={2} value={project.subtitle} onChange={(e) => onFieldChange('subtitle', e.target.value)} />
      </Field>
      <Field label="主視覺圖片">
        <ImageModuleSlot
          label="主視覺圖片"
          sectionKey="shop_hero_image"
          image={heroImage}
          uploadingSlot={uploadingSlot}
          onImageUpload={onImageUpload}
          onImageDelete={onImageDelete}
        />
      </Field>
    </div>
  )
}
