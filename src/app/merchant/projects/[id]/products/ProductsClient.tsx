'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Upload, X, Check, Tag, ShoppingBag, PackageOpen } from 'lucide-react'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Product = {
  id: string
  itemKey: string
  name: string
  description: string
  price: string
  salesPrice: string
  sortOrder: number
  imageUrl: string | null
  imageId: string | null
}

type ProductsClientProps = {
  projectId: string
  projectName: string
  initialProducts: Product[]
}

// ── Animation ─────────────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function newProduct(sortOrder: number): Product {
  return {
    id: '',
    itemKey: crypto.randomUUID(),
    name: '',
    description: '',
    price: '',
    salesPrice: '',
    sortOrder,
    imageUrl: null,
    imageId: null,
  }
}

async function saveProducts(projectId: string, products: Product[]) {
  const contentItems = products.map((p, i) => ({
    groupKey: 'shop_products',
    itemKey: p.itemKey,
    title: p.name.trim(),
    body: p.description.trim(),
    meta: p.price.trim(),
    accent: p.salesPrice.trim(),
    state: null,
    sortOrder: i,
  }))

  const res = await fetch(`/api/merchant/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentItems }),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new Error(payload.error ?? '儲存失敗')
  }
}

// ── Image upload slot ─────────────────────────────────────────────────────────

function ProductImageSlot({
  projectId,
  product,
  onImageChange,
}: {
  projectId: string
  product: Product
  onImageChange: (imageUrl: string | null, imageId: string | null) => void
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      if (product.imageId) {
        await fetch(`/api/merchant/projects/${projectId}/images/${product.imageId}`, { method: 'DELETE' })
      }
      const form = new FormData()
      form.set('sectionKey', `shop_product_${product.itemKey}`)
      form.set('file', file)
      form.set('altText', product.name || '商品圖片')
      const res = await fetch(`/api/merchant/projects/${projectId}/images`, { method: 'POST', body: form })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload.image) throw new Error(payload.error ?? '上傳失敗')
      onImageChange(payload.image.url, payload.image.id)
      toast.success('圖片已更新')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '上傳失敗')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    if (!product.imageId) return
    try {
      await fetch(`/api/merchant/projects/${projectId}/images/${product.imageId}`, { method: 'DELETE' })
      onImageChange(null, null)
      toast.success('圖片已移除')
    } catch {
      toast.error('移除失敗')
    }
  }

  return (
    <div className="group/img relative aspect-square w-full overflow-hidden rounded-t-xl bg-foreground/[0.03]">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ position: 'fixed', left: '-9999px', top: 0, width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleUpload(file)
          e.target.value = ''
        }}
      />

      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          <Upload className="h-5 w-5 text-foreground/15" />
          <p className="text-[0.58rem] uppercase tracking-[0.35em] text-foreground/20">商品圖片</p>
        </div>
      )}

      {/* Overlay */}
      <div className={`absolute inset-0 flex items-center justify-center gap-2 bg-foreground/40 backdrop-blur-[2px] transition-opacity duration-150 ${uploading ? 'opacity-100' : 'opacity-0 group-hover/img:opacity-100'}`}>
        {uploading ? (
          <p className="text-[0.65rem] uppercase tracking-widest text-white">上傳中…</p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-foreground shadow-md transition-transform hover:scale-105"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
            {product.imageUrl && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-rose-500 shadow-md transition-transform hover:scale-105"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Product card ──────────────────────────────────────────────────────────────

function ProductCard({
  product,
  projectId,
  isEditing,
  index,
  onEdit,
  onSave,
  onDelete,
  onImageChange,
}: {
  product: Product
  projectId: string
  isEditing: boolean
  index: number
  onEdit: () => void
  onSave: (updated: Product) => void
  onDelete: () => void
  onImageChange: (imageUrl: string | null, imageId: string | null) => void
}) {
  const [draft, setDraft] = useState<Product>(product)

  function field(key: keyof Product) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft((p) => ({ ...p, [key]: e.target.value }))
  }

  const hasSale = draft.salesPrice.trim().length > 0
  const displaySale = product.salesPrice.trim().length > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
        isEditing
          ? 'border-foreground/20 shadow-md'
          : 'border-foreground/[0.08] shadow-sm hover:border-foreground/15 hover:shadow-md'
      }`}
    >
      {/* Image */}
      <ProductImageSlot projectId={projectId} product={product} onImageChange={onImageChange} />

      {/* Sale badge */}
      {!isEditing && displaySale && (
        <div
          className="absolute left-3 top-3 flex items-center gap-1 px-2 py-1"
          style={{
            background: 'rgba(239,68,68,0.9)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Tag className="h-2.5 w-2.5 text-white" />
          <span className="text-[0.55rem] uppercase tracking-widest text-white font-medium">特價</span>
        </div>
      )}

      {/* Delete button */}
      {!isEditing && (
        <button
          type="button"
          onClick={onDelete}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground/35 opacity-0 shadow-sm backdrop-blur-sm transition-all duration-150 hover:text-rose-500 group-hover:opacity-100"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}

      {/* Info */}
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <input
              autoFocus
              value={draft.name}
              onChange={field('name')}
              placeholder="商品名稱"
              className="w-full border-b border-foreground/15 bg-transparent py-1 text-sm font-medium outline-none placeholder:text-foreground/25 focus:border-foreground/35"
            />
            <textarea
              value={draft.description}
              onChange={field('description')}
              placeholder="商品描述"
              rows={2}
              className="w-full resize-none border-b border-foreground/10 bg-transparent py-1 text-xs leading-relaxed text-foreground/70 outline-none placeholder:text-foreground/25 focus:border-foreground/25"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1.5 text-[0.58rem] uppercase tracking-[0.3em] text-muted-foreground">定價</p>
                <input
                  value={draft.price}
                  onChange={field('price')}
                  placeholder="NT$980"
                  className="w-full border-b border-foreground/15 bg-transparent py-0.5 text-xs font-serif outline-none placeholder:text-foreground/20 focus:border-foreground/35"
                />
              </div>
              <div>
                <p className="mb-1.5 text-[0.58rem] uppercase tracking-[0.3em] text-muted-foreground">
                  特價
                  <span className="ml-1 text-[0.52rem] normal-case tracking-normal opacity-60">（選填）</span>
                </p>
                <input
                  value={draft.salesPrice}
                  onChange={field('salesPrice')}
                  placeholder="NT$780"
                  className="w-full border-b border-foreground/15 bg-transparent py-0.5 text-xs font-serif text-rose-500 outline-none placeholder:text-foreground/20 focus:border-rose-300"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setDraft(product); onEdit() }}
                className="flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[0.7rem] text-foreground/40 transition-colors hover:text-foreground/70"
              >
                <X className="h-3 w-3" /> 取消
              </button>
              <button
                type="button"
                onClick={() => onSave(draft)}
                className="flex h-7 items-center gap-1.5 rounded-lg px-3 text-[0.7rem] font-medium"
                style={{ background: '#1a1a1a', color: '#faf9f6' }}
              >
                <Check className="h-3 w-3" /> 儲存
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={onEdit} className="w-full text-left">
            <p className="truncate text-sm font-medium text-foreground">
              {product.name || <span className="text-foreground/25">未命名商品</span>}
            </p>
            {product.description && (
              <p className="mt-1 line-clamp-2 text-[0.7rem] leading-relaxed text-muted-foreground/70">
                {product.description}
              </p>
            )}
            <div className="mt-3 flex items-baseline gap-1.5">
              {displaySale ? (
                <>
                  <span className="font-serif text-base font-light text-rose-500">{product.salesPrice}</span>
                  <span className="text-xs text-muted-foreground/40 line-through">{product.price}</span>
                </>
              ) : (
                <span className="font-serif text-base font-light text-foreground/80">
                  {product.price || <span className="text-sm text-foreground/25">未設定價格</span>}
                </span>
              )}
            </div>
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProductsClient({ projectId, projectName, initialProducts }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const saleCount = products.filter((p) => p.salesPrice.trim()).length

  async function handleSave(updated: Product) {
    const next = products.map((p) => p.itemKey === updated.itemKey ? updated : p)
    setSaving(true)
    try {
      await saveProducts(projectId, next)
      setProducts(next)
      setEditingKey(null)
      toast.success('商品已儲存')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  async function handleAdd() {
    const p = newProduct(products.length)
    const next = [...products, p]
    setSaving(true)
    try {
      await saveProducts(projectId, next)
      setProducts(next)
      setEditingKey(p.itemKey)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '新增失敗')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(itemKey: string) {
    const target = products.find((p) => p.itemKey === itemKey)
    const next = products.filter((p) => p.itemKey !== itemKey)
    setSaving(true)
    try {
      if (target?.imageId) {
        await fetch(`/api/merchant/projects/${projectId}/images/${target.imageId}`, { method: 'DELETE' })
      }
      await saveProducts(projectId, next)
      setProducts(next)
      if (editingKey === itemKey) setEditingKey(null)
      toast.success('商品已刪除')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '刪除失敗')
    } finally {
      setSaving(false)
    }
  }

  function handleImageChange(itemKey: string, imageUrl: string | null, imageId: string | null) {
    setProducts((ps) => ps.map((p) => p.itemKey === itemKey ? { ...p, imageUrl, imageId } : p))
  }

  return (
    <div className="space-y-8 max-w-4xl">

      {/* ── Title ── */}
      <motion.div {...fadeUp(0.05)}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">商案管理</p>
        <h1 className="text-3xl font-serif font-light leading-tight">商品列表</h1>
        <p className="text-sm text-muted-foreground mt-2">{projectName}</p>
      </motion.div>

      {/* ── Stats row ── */}
      {products.length > 0 && (
        <motion.div {...fadeUp(0.1)}>
          <div className="grid grid-cols-3 rounded-xl border border-foreground/[0.08] bg-background shadow-sm overflow-hidden">
            {[
              { label: '商品總數', value: products.length.toString(), sub: '件' },
              {
                label: '特價商品',
                value: saleCount.toString(),
                sub: saleCount > 0 ? `佔 ${Math.round((saleCount / products.length) * 100)}%` : '無特價',
              },
              {
                label: '待補資料',
                value: products.filter((p) => !p.name || !p.price).length.toString(),
                sub: '商品名稱或價格未填',
              },
            ].map(({ label, value, sub }, i) => (
              <div
                key={label}
                className="px-5 py-5"
                style={{ borderRight: i < 2 ? '1px solid rgba(26,26,26,0.08)' : undefined }}
              >
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground mb-1.5">{label}</p>
                <p className="text-2xl font-serif font-light">{value}</p>
                <p className="text-[0.7rem] text-muted-foreground/60 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Products grid ── */}
      <motion.div {...fadeUp(0.15)}>
        <div className="rounded-xl border border-foreground/[0.08] bg-background shadow-sm overflow-hidden">

          {/* Section header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.07]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">商品管理</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                {products.length > 0 ? `共 ${products.length} 件商品` : '尚未新增任何商品'}
                {saving && <span className="ml-2 text-muted-foreground/40">儲存中…</span>}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-40"
              style={{ background: '#1a1a1a', color: '#faf9f6' }}
            >
              <Plus className="h-3.5 w-3.5" />
              新增商品
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: 'rgba(26,26,26,0.05)' }}
                >
                  <PackageOpen className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground/60">還沒有商品</p>
                <p className="mt-1 text-xs text-muted-foreground/40">點擊「新增商品」開始建立你的商品列表</p>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="mt-6 flex items-center gap-1.5 rounded-xl border border-foreground/[0.12] px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  新增第一個商品
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {products.map((product, i) => (
                    <ProductCard
                      key={product.itemKey}
                      product={product}
                      projectId={projectId}
                      isEditing={editingKey === product.itemKey}
                      index={i}
                      onEdit={() => setEditingKey(editingKey === product.itemKey ? null : product.itemKey)}
                      onSave={handleSave}
                      onDelete={() => handleDelete(product.itemKey)}
                      onImageChange={(url, id) => handleImageChange(product.itemKey, url, id)}
                    />
                  ))}
                </AnimatePresence>

                {/* Ghost add card */}
                <motion.button
                  layout
                  type="button"
                  onClick={handleAdd}
                  disabled={saving}
                  className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-foreground/[0.1] text-foreground/25 transition-all duration-150 hover:border-foreground/25 hover:text-foreground/50 disabled:opacity-40"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span className="text-[0.62rem] uppercase tracking-[0.3em]">新增</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

    </div>
  )
}
