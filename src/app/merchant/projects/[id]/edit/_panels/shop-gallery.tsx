'use client'

import { useRef } from 'react'
import { Upload, Trash2 } from 'lucide-react'
import { Field, Input } from '../_ui'
import type { PanelProps } from '../_types'

const GALLERY_SLOTS = [
  'shop_gallery_1', 'shop_gallery_2', 'shop_gallery_3',
  'shop_gallery_4', 'shop_gallery_5', 'shop_gallery_6',
] as const

// ── Compact square tile — mirrors the public gallery's aspect-square grid ──────

function GallerySlot({
  sectionKey,
  index,
  image,
  uploadingSlot,
  onImageUpload,
  onImageDelete,
}: {
  sectionKey: string
  index: number
  image: { id: string; url: string; altText: string } | undefined
  uploadingSlot: string | null
  onImageUpload: (sectionKey: string, file: File | null) => Promise<void>
  onImageDelete: (imageId: string) => Promise<void>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isUploading = uploadingSlot === sectionKey

  return (
    <div className="group relative">
      {/* Hidden file input — off-screen to prevent sidebar scroll-jump */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ position: 'fixed', left: '-9999px', top: 0, width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
        tabIndex={-1}
        disabled={isUploading}
        onChange={(e) => { void onImageUpload(sectionKey, e.target.files?.[0] ?? null); e.target.value = '' }}
      />

      {/* Square tile */}
      <div
        role="button"
        tabIndex={isUploading ? -1 : 0}
        onClick={() => { if (!isUploading) inputRef.current?.click() }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!isUploading) inputRef.current?.click() } }}
        className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-md border border-foreground/10 bg-muted/20 outline-none focus-visible:ring-1 focus-visible:ring-foreground/30"
      >
        {image?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.url} alt={image.altText || `相簿 ${index + 1}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5">
            <Upload className="h-3.5 w-3.5 text-muted-foreground/25" />
            <span className="font-mono text-[0.6rem] text-muted-foreground/25">{index + 1}</span>
          </div>
        )}

        {/* Upload overlay on hover / while uploading */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 bg-foreground/55 transition-opacity duration-150 ${
          isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          {isUploading
            ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
            : (
              <>
                <Upload className="h-3 w-3 text-background" />
                <span className="text-[0.5rem] uppercase tracking-widest text-background">上傳</span>
              </>
            )
          }
        </div>
      </div>

      {/* Delete badge — top-right corner, visible on group-hover when image exists */}
      {image && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); void onImageDelete(image.id) }}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
          title="刪除圖片"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  )
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export function ShopGalleryPanel({ project, module, uploadingSlot, onModuleChange, onImageUpload, onImageDelete }: PanelProps) {
  return (
    <div className="space-y-5">
      <Field label="區塊標題">
        <Input
          value={module.settings.title ?? ''}
          onChange={(e) => onModuleChange(module.id, (m) => ({ ...m, settings: { ...m.settings, title: e.target.value } }))}
          placeholder="品牌相簿"
        />
      </Field>

      {/* 3×2 grid — mirrors the public gallery's sm:grid-cols-3 / aspect-square layout */}
      <div>
        <label className="mb-2.5 block text-xs uppercase tracking-[0.4em] text-muted-foreground">
          相簿圖片
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {GALLERY_SLOTS.map((sectionKey, i) => {
            const image = project.images.find((img) => img.sectionKey === sectionKey)
            return (
              <GallerySlot
                key={sectionKey}
                sectionKey={sectionKey}
                index={i}
                image={image}
                uploadingSlot={uploadingSlot}
                onImageUpload={onImageUpload}
                onImageDelete={onImageDelete}
              />
            )
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground/45">點擊方塊上傳，懸停可刪除</p>
      </div>
    </div>
  )
}
