'use client'

import { useRef } from 'react'
import { Upload, Trash2 } from 'lucide-react'
import type { TongchuangTemplateContent } from '@/lib/property-template'
import { IMAGE_SLOT_LABELS, type ProjectImage } from '../_types'

// ── ImageModuleSlot ───────────────────────────────────────────────────────────
// Full-width slot with delete affordance. Used by ImageSectionPanel & FloorPlanPanel.

export function ImageModuleSlot({
  label,
  sectionKey,
  image,
  uploadingSlot,
  onImageUpload,
  onImageDelete,
}: {
  label: string
  sectionKey: string
  image: ProjectImage | undefined
  uploadingSlot: string | null
  onImageUpload: (sectionKey: string, file: File | null) => Promise<void>
  onImageDelete: (imageId: string) => Promise<void>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isUploading = uploadingSlot === sectionKey
  return (
    <div className="space-y-2">
      <p className="text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      {/* Fixed off-screen input prevents sidebar scroll-jump on focus */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ position: 'fixed', left: '-9999px', top: 0, width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
        tabIndex={-1}
        disabled={isUploading}
        onChange={(e) => { void onImageUpload(sectionKey, e.target.files?.[0] ?? null); e.target.value = '' }}
      />
      <div
        role="button"
        tabIndex={isUploading ? -1 : 0}
        className="group block cursor-pointer outline-none"
        onClick={() => { if (!isUploading) inputRef.current?.click() }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!isUploading) inputRef.current?.click() } }}
      >
        <div className="relative overflow-hidden rounded-md border border-foreground/10 bg-muted/20">
          {image?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.url} alt={image.altText || label} className="block aspect-[16/9] w-full object-cover" />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center">
              <Upload className="h-4 w-4 text-muted-foreground/30" />
            </div>
          )}
          <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-foreground/55 transition-opacity duration-150 ${
            isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            {isUploading
              ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
              : <><Upload className="h-3.5 w-3.5 text-background" /><span className="text-[0.56rem] uppercase tracking-widest text-background">更換圖片</span></>
            }
          </div>
        </div>
      </div>
      {image && (
        <button
          type="button"
          onClick={() => void onImageDelete(image.id)}
          className="inline-flex items-center gap-1 text-[0.58rem] uppercase tracking-widest text-red-500/80 transition-colors duration-150 hover:text-red-500"
        >
          <Trash2 className="h-3 w-3" />
          刪除圖片
        </button>
      )}
    </div>
  )
}

// ── ImageSlotGrid ─────────────────────────────────────────────────────────────
// Grid of named image slots (e.g. timeline images). No delete affordance.

export function ImageSlotGrid({
  slots,
  images,
  fallbackImages,
  uploadingSlot,
  onImageUpload,
}: {
  slots: string[]
  images: ProjectImage[]
  fallbackImages: TongchuangTemplateContent['images']
  uploadingSlot: string | null
  onImageUpload: (sectionKey: string, file: File | null) => Promise<void>
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {slots.map((sectionKey) => {
        const image = images.find((img) => img.sectionKey === sectionKey)
        const fallback = fallbackImages[sectionKey as keyof typeof fallbackImages]
        return (
          <ImageSlotCard
            key={sectionKey}
            label={IMAGE_SLOT_LABELS[sectionKey] ?? sectionKey}
            sectionKey={sectionKey}
            image={image}
            fallbackUrl={fallback?.url}
            uploadingSlot={uploadingSlot}
            onImageUpload={(file) => onImageUpload(sectionKey, file)}
          />
        )
      })}
    </div>
  )
}

// ── ImageSlotCard ─────────────────────────────────────────────────────────────
// Single compact card used inside ImageSlotGrid.

function ImageSlotCard({
  label,
  sectionKey,
  image,
  fallbackUrl,
  uploadingSlot,
  onImageUpload,
}: {
  label: string
  sectionKey: string
  image: ProjectImage | undefined
  fallbackUrl?: string
  uploadingSlot: string | null
  onImageUpload: (file: File | null) => Promise<void>
}) {
  const isUploading = uploadingSlot === sectionKey
  const displayUrl  = image?.url ?? fallbackUrl
  return (
    <label className="group block cursor-pointer">
      <div className="relative overflow-hidden rounded-md border border-foreground/10 bg-muted/20">
        {displayUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={displayUrl} alt={image?.altText || sectionKey} className="block aspect-[16/9] w-full object-cover" />
            {!image && (
              <span className="pointer-events-none absolute left-1 top-1 rounded-sm bg-black/60 px-1.5 py-0.5 text-[0.5rem] uppercase tracking-widest text-white/60">
                預設
              </span>
            )}
          </>
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center">
            <Upload className="h-4 w-4 text-muted-foreground/30" />
          </div>
        )}
        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-foreground/55 transition-opacity duration-150 ${
          isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          {isUploading
            ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
            : <><Upload className="h-3.5 w-3.5 text-background" /><span className="text-[0.56rem] uppercase tracking-widest text-background">更換圖片</span></>
          }
        </div>
      </div>
      <p className="mt-1 text-[0.58rem] leading-tight text-muted-foreground">{label}</p>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        disabled={isUploading}
        onChange={(e) => { void onImageUpload(e.target.files?.[0] ?? null); e.target.value = '' }}
      />
    </label>
  )
}
