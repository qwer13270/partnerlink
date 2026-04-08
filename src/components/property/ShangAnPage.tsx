'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, ChevronDown, Phone, Mail, ArrowUpRight } from 'lucide-react'
import type { ShangAnTemplateContent, ShangAnTemplateModule } from '@/lib/property-template'
import { PROPERTY_THEMES, PROPERTY_FONT_THEMES, DEFAULT_THEME_KEY, DEFAULT_FONT_KEY } from '@/lib/property-template'

// ── Animation presets ─────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
})

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

// ── Props ─────────────────────────────────────────────────────────────────────

interface ShangAnPageProps {
  content: ShangAnTemplateContent
  referrer?: string | null
  editor?: {
    isEditing: boolean
    selectedModuleId: string | null
    onModuleSelect?: (moduleId: string) => void
  }
}

// ── Module wrapper (editor integration) ──────────────────────────────────────

function ModuleWrapper({
  module,
  editor,
  children,
}: {
  module: ShangAnTemplateModule
  editor?: ShangAnPageProps['editor']
  children: React.ReactNode
}) {
  if (!module.isVisible && !editor?.isEditing) return null

  const isSelected = editor?.selectedModuleId === module.id
  const isEditing = Boolean(editor?.isEditing)

  return (
    <div
      data-module-id={module.id}
      onClick={isEditing ? () => editor?.onModuleSelect?.(module.id) : undefined}
      className={[
        'relative scroll-mt-16',
        isEditing ? 'cursor-pointer' : '',
        isEditing && isSelected
          ? 'outline outline-2 outline-offset-[-2px] outline-[var(--p-accent)]'
          : isEditing
          ? 'outline outline-1 outline-offset-[-1px] outline-transparent hover:outline-[var(--p-accent)]/40'
          : '',
        !module.isVisible ? 'opacity-40' : '',
      ].join(' ')}
    >
      {children}
    </div>
  )
}

// ── Shared section primitives ─────────────────────────────────────────────────

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-[var(--p-accent)]">
      {children}
    </p>
  )
}

function SectionTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`text-2xl font-light leading-snug tracking-wide text-[var(--p-text)] sm:text-[1.85rem] ${className}`}
      style={{ fontFamily: 'var(--p-font-display)' }}
    >
      {children}
    </h2>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection({
  content,
  module,
  editor,
}: {
  content: ShangAnTemplateContent
  module: ShangAnTemplateModule
  editor?: ShangAnPageProps['editor']
}) {
  const [activeIdx, setActiveIdx] = useState(0)

  // Build image list from all product images (those that have one)
  const images = content.products
    .filter((p) => Boolean(p.imageUrl))
    .map((p) => ({ url: p.imageUrl!, alt: p.name }))

  // Fall back to hero image if no product images exist
  if (images.length === 0 && content.heroImage?.url) {
    images.push({ url: content.heroImage.url, alt: content.heroImage.alt })
  }

  // Use first product for price/CTA if available
  const featured = content.products[0] ?? null
  const activeImg = images[activeIdx]

  const hasImages = images.length > 0

  return (
    <ModuleWrapper module={module} editor={editor}>
      <section className="bg-[var(--p-bg)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_480px] lg:gap-14 xl:grid-cols-[1fr_520px]">

            {/* ── LEFT: Image gallery ─────────────────────────────────── */}
            <div className="flex flex-col gap-3">
              {/* Main image */}
              <motion.div
                {...fadeIn(0)}
                className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[var(--p-bg-2)]"
              >
                {activeImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={activeImg.url}
                    src={activeImg.url}
                    alt={activeImg.alt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ShoppingCart className="h-12 w-12 text-[var(--p-text-ghost)]" />
                  </div>
                )}
              </motion.div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveIdx(i)}
                      className={`relative aspect-square h-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150 ${
                        activeIdx === i
                          ? 'border-[var(--p-accent)] opacity-100'
                          : 'border-transparent opacity-55 hover:opacity-80'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Placeholder thumbnails when no images uploaded */}
              {!hasImages && editor?.isEditing && (
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-square h-16 rounded-lg border-2 border-dashed border-[var(--p-border)] bg-[var(--p-bg-2)]"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Product info ─────────────────────────────────── */}
            <div className="flex flex-col justify-center py-2 lg:py-8">
              {/* Eyebrow / brand tag */}
              {content.subtitle && (
                <motion.p
                  {...fadeUp(0.05)}
                  className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.45em] text-[var(--p-accent)]"
                >
                  {content.subtitle}
                </motion.p>
              )}

              {/* Brand / product name */}
              <motion.h1
                {...fadeUp(0.1)}
                className="text-3xl font-light leading-snug tracking-tight text-[var(--p-text)] sm:text-4xl"
                style={{ fontFamily: 'var(--p-font-display)' }}
              >
                {featured ? featured.name : content.name}
              </motion.h1>

              {/* Price */}
              {featured && (featured.price || featured.salesPrice) && (
                <motion.div {...fadeUp(0.15)} className="mt-5 flex items-baseline gap-3">
                  {featured.salesPrice ? (
                    <>
                      <span className="text-2xl font-semibold text-rose-500">{featured.salesPrice}</span>
                      <span className="text-base text-[var(--p-text-ghost)] line-through">{featured.price}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-semibold text-[var(--p-text)]">{featured.price}</span>
                  )}
                </motion.div>
              )}

              {/* Description */}
              {featured?.description && (
                <motion.p
                  {...fadeUp(0.2)}
                  className="mt-4 text-[0.88rem] leading-relaxed text-[var(--p-text-muted)]"
                >
                  {featured.description}
                </motion.p>
              )}

              {/* Divider */}
              <motion.div {...fadeIn(0.22)} className="my-6 h-px bg-[var(--p-border)]" />

              {/* CTA buttons — always shown; link only when checkoutUrl is set */}
              <motion.div {...fadeUp(0.25)} className="flex flex-col gap-3 sm:flex-row">
                {featured?.checkoutUrl ? (
                  <a
                    href={featured.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-1 items-center justify-center rounded-full bg-[var(--p-text)] py-3.5 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-[var(--p-bg)] transition-opacity hover:opacity-80"
                  >
                    立即購買
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-1 items-center justify-center rounded-full bg-[var(--p-text)] py-3.5 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-[var(--p-bg)] opacity-100"
                  >
                    立即購買
                  </button>
                )}
                {featured?.checkoutUrl ? (
                  <a
                    href={featured.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-1 items-center justify-center rounded-full border-2 border-[var(--p-text)] py-3.5 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-[var(--p-text)] transition-colors hover:bg-[var(--p-text)] hover:text-[var(--p-bg)]"
                  >
                    加入購物車
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-1 items-center justify-center rounded-full border-2 border-[var(--p-text)] py-3.5 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-[var(--p-text)]"
                  >
                    加入購物車
                  </button>
                )}
              </motion.div>

              {/* Trust row */}
              <motion.div
                {...fadeIn(0.32)}
                className="mt-6 flex flex-wrap gap-x-5 gap-y-1.5"
              >
                {[
                  '品質保證',
                  '快速出貨',
                  '7 天退換',
                ].map((label) => (
                  <span key={label} className="flex items-center gap-1.5 text-[0.72rem] text-[var(--p-text-muted)]">
                    <span className="h-1 w-1 rounded-full bg-[var(--p-accent)]" />
                    {label}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </ModuleWrapper>
  )
}

// ── Products ──────────────────────────────────────────────────────────────────

function ProductsSection({
  content,
  module,
  editor,
}: {
  content: ShangAnTemplateContent
  module: ShangAnTemplateModule
  editor?: ShangAnPageProps['editor']
}) {
  const title = module.settings.title?.trim() || '精選商品'

  return (
    <ModuleWrapper module={module} editor={editor}>
      <section className="bg-[var(--p-bg)] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          {/* Section header */}
          <motion.div {...fadeUp()} className="mb-14 text-center">
            <SectionEyebrow>Products</SectionEyebrow>
            <SectionTitle>{title}</SectionTitle>
          </motion.div>

          {/* Product grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {content.products.map((product, i) => (
              <motion.div
                key={product.itemKey ?? i}
                {...fadeUp(i * 0.07)}
                className="group flex flex-col overflow-hidden rounded-[1.25rem] border border-[var(--p-border)] bg-[var(--p-bg-card)] transition-all duration-300 hover:shadow-[0_10px_36px_rgba(0,0,0,0.10)]"
              >
                {/* Square product image */}
                <div className="aspect-square overflow-hidden bg-[var(--p-bg-2)]">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                      <ShoppingCart className="h-7 w-7 text-[var(--p-text-ghost)]" />
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col p-5">
                  <h3
                    className="text-[0.93rem] font-medium leading-snug text-[var(--p-text)]"
                    style={{ fontFamily: 'var(--p-font-display)' }}
                  >
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="mt-1.5 flex-1 text-[0.8rem] leading-relaxed text-[var(--p-text-muted)]">
                      {product.description}
                    </p>
                  )}

                  {/* Price + CTA row */}
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-1.5">
                      {product.salesPrice ? (
                        <>
                          <span className="text-base font-semibold text-rose-500">{product.salesPrice}</span>
                          <span className="text-xs text-[var(--p-text-ghost)] line-through">{product.price}</span>
                        </>
                      ) : product.price ? (
                        <span className="text-base font-medium text-[var(--p-text)]">{product.price}</span>
                      ) : null}
                    </div>

                    {product.checkoutUrl && (
                      <a
                        href={product.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--p-text)] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[var(--p-bg)] transition-opacity duration-200 hover:opacity-75"
                      >
                        立即購買
                        <ArrowUpRight className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </ModuleWrapper>
  )
}

// ── About ─────────────────────────────────────────────────────────────────────

function AboutSection({
  content,
  module,
  editor,
}: {
  content: ShangAnTemplateContent
  module: ShangAnTemplateModule
  editor?: ShangAnPageProps['editor']
}) {
  return (
    <ModuleWrapper module={module} editor={editor}>
      <section className="bg-[var(--p-bg-2)] px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div {...fadeUp()}>
            <SectionEyebrow>About</SectionEyebrow>
            <SectionTitle className="mb-8">{content.overviewTitle}</SectionTitle>
          </motion.div>

          {/* Accent divider */}
          <motion.div
            {...fadeIn(0.15)}
            className="mx-auto mb-9 flex items-center justify-center gap-2"
          >
            <div className="h-px w-8 bg-[var(--p-accent)]/40" />
            <div className="h-1 w-1 rounded-full bg-[var(--p-accent)]" />
            <div className="h-px w-8 bg-[var(--p-accent)]/40" />
          </motion.div>

          <motion.p
            {...fadeUp(0.2)}
            className="whitespace-pre-line text-[0.9rem] leading-[2.1] text-[var(--p-text-muted)]"
          >
            {content.overviewBody}
          </motion.p>
        </div>
      </section>
    </ModuleWrapper>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────

function FeaturesSection({
  content,
  module,
  editor,
}: {
  content: ShangAnTemplateContent
  module: ShangAnTemplateModule
  editor?: ShangAnPageProps['editor']
}) {
  const title = module.settings.title?.trim() || '品牌特色'

  return (
    <ModuleWrapper module={module} editor={editor}>
      <section className="bg-[var(--p-bg)] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp()} className="mb-14 text-center">
            <SectionEyebrow>Features</SectionEyebrow>
            <SectionTitle>{title}</SectionTitle>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.features.map((feat, i) => (
              <motion.div
                key={feat.itemKey ?? i}
                {...fadeUp(i * 0.07)}
                className="group rounded-[1.25rem] border border-[var(--p-border)] bg-[var(--p-bg-card)] p-6 transition-all duration-200 hover:border-[var(--p-accent)]/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]"
              >
                {/* Number badge */}
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--p-accent)]/10">
                  <span className="text-[0.62rem] font-bold uppercase tracking-widest text-[var(--p-accent)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3
                  className="mb-2 text-[0.88rem] font-semibold leading-snug text-[var(--p-text)]"
                  style={{ fontFamily: 'var(--p-font-display)' }}
                >
                  {feat.title}
                </h3>
                <p className="text-[0.8rem] leading-relaxed text-[var(--p-text-muted)]">{feat.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </ModuleWrapper>
  )
}

// ── Gallery ───────────────────────────────────────────────────────────────────

function GallerySection({
  content,
  module,
  editor,
}: {
  content: ShangAnTemplateContent
  module: ShangAnTemplateModule
  editor?: ShangAnPageProps['editor']
}) {
  const title = module.settings.title?.trim() || '品牌相簿'
  if (content.galleryImages.length === 0 && !editor?.isEditing) return null

  return (
    <ModuleWrapper module={module} editor={editor}>
      <section className="bg-[var(--p-bg-2)] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp()} className="mb-12 text-center">
            <SectionEyebrow>Gallery</SectionEyebrow>
            <SectionTitle>{title}</SectionTitle>
          </motion.div>

          {content.galleryImages.length === 0 ? (
            <p className="text-center text-sm text-[var(--p-text-ghost)]">尚未上傳相簿圖片</p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {content.galleryImages.map((img, i) => (
                <motion.div
                  key={img.sectionKey}
                  {...fadeUp(i * 0.05)}
                  className="group aspect-square overflow-hidden rounded-[1.25rem] bg-[var(--p-bg)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt || img.caption}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </ModuleWrapper>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

function FaqSection({
  content,
  module,
  editor,
}: {
  content: ShangAnTemplateContent
  module: ShangAnTemplateModule
  editor?: ShangAnPageProps['editor']
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const title = module.settings.title?.trim() || '常見問題'

  return (
    <ModuleWrapper module={module} editor={editor}>
      <section className="bg-[var(--p-bg)] px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <motion.div {...fadeUp()} className="mb-12 text-center">
            <SectionEyebrow>FAQ</SectionEyebrow>
            <SectionTitle>{title}</SectionTitle>
          </motion.div>

          <div className="divide-y divide-[var(--p-border)]">
            {content.faq.map((item, i) => {
              const isOpen = openIndex === i
              return (
                <motion.div key={item.itemKey ?? i} {...fadeUp(i * 0.05)}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-5 text-left"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenIndex(isOpen ? null : i)
                    }}
                  >
                    <span className="pr-4 text-[0.88rem] font-medium leading-snug text-[var(--p-text)]">
                      {item.question}
                    </span>
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--p-border)] transition-all duration-300 ${
                        isOpen
                          ? 'rotate-180 border-[var(--p-accent)]/40 bg-[var(--p-accent)]/8'
                          : 'bg-transparent'
                      }`}
                    >
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-colors duration-200 ${
                          isOpen ? 'text-[var(--p-accent)]' : 'text-[var(--p-text-muted)]'
                        }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 text-[0.83rem] leading-relaxed text-[var(--p-text-muted)]">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </ModuleWrapper>
  )
}

// ── Contact ───────────────────────────────────────────────────────────────────

function ContactSection({
  content,
  module,
  editor,
}: {
  content: ShangAnTemplateContent
  module: ShangAnTemplateModule
  editor?: ShangAnPageProps['editor']
}) {
  return (
    <ModuleWrapper module={module} editor={editor}>
      <section className="bg-[var(--p-bg-contact)] px-6 py-24">
        <div className="mx-auto max-w-lg text-center">
          <motion.div {...fadeUp()}>
            <SectionEyebrow>Contact</SectionEyebrow>
            <SectionTitle className="mb-5">{content.contactTitle}</SectionTitle>
          </motion.div>

          <motion.p
            {...fadeUp(0.1)}
            className="mb-10 text-[0.86rem] leading-loose text-[var(--p-text-muted)]"
          >
            {content.contactBody}
          </motion.p>

          <motion.div {...fadeUp(0.2)} className="flex flex-col items-center gap-3">
            {content.contactPhone && (
              <a
                href={`tel:${content.contactPhone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 rounded-full border border-[var(--p-border)] px-6 py-2.5 text-[0.82rem] text-[var(--p-text)] transition-all duration-200 hover:border-[var(--p-accent)]/50 hover:text-[var(--p-accent)]"
              >
                <Phone className="h-3.5 w-3.5" />
                {content.contactPhone}
              </a>
            )}

            <a
              href="#contact"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 rounded-full bg-[var(--p-text)] px-8 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[var(--p-bg)] transition-opacity duration-200 hover:opacity-80"
            >
              <Mail className="h-3.5 w-3.5" />
              聯絡我們
            </a>
          </motion.div>
        </div>
      </section>
    </ModuleWrapper>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function FooterSection({
  content,
  module,
  editor,
}: {
  content: ShangAnTemplateContent
  module: ShangAnTemplateModule
  editor?: ShangAnPageProps['editor']
}) {
  return (
    <ModuleWrapper module={module} editor={editor}>
      <footer className="bg-[var(--p-bg)] px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="border-t border-[var(--p-border)] pt-10 text-center">
            <p
              className="text-[0.8rem] tracking-[0.25em] text-[var(--p-text-muted)]"
              style={{ fontFamily: 'var(--p-font-display)' }}
            >
              {content.name}
            </p>
            {content.footerDisclaimer && (
              <p className="mx-auto mt-4 max-w-xl text-[0.67rem] leading-relaxed text-[var(--p-text-ghost)]">
                {content.footerDisclaimer}
              </p>
            )}
          </div>
        </div>
      </footer>
    </ModuleWrapper>
  )
}

// ── Module renderer map ───────────────────────────────────────────────────────

type SectionProps = {
  content: ShangAnTemplateContent
  module: ShangAnTemplateModule
  editor?: ShangAnPageProps['editor']
}

const SECTION_RENDERERS: Partial<Record<string, React.FC<SectionProps>>> = {
  shop_hero:     HeroSection,
  shop_products: ProductsSection,
  shop_about:    AboutSection,
  shop_features: FeaturesSection,
  shop_gallery:  GallerySection,
  shop_faq:      FaqSection,
  shop_contact:  ContactSection,
  shop_footer:   FooterSection,
}

// ── Page root ─────────────────────────────────────────────────────────────────

export default function ShangAnPage({ content, editor }: ShangAnPageProps) {
  void editor

  const themeVars = PROPERTY_THEMES[content.colorTheme] ?? PROPERTY_THEMES[DEFAULT_THEME_KEY]
  const fontVars  = PROPERTY_FONT_THEMES[content.fontTheme] ?? PROPERTY_FONT_THEMES[DEFAULT_FONT_KEY]

  const cssVars = useMemo(
    () => ({ ...themeVars, ...fontVars } as React.CSSProperties),
    [themeVars, fontVars],
  )

  const orderedModules = useMemo(() => {
    const visible = content.modules.filter((m) => m.isVisible || editor?.isEditing)
    const pinned  = visible.filter((m) => m.pinned)
    const normal  = visible.filter((m) => !m.pinned)
    return [...normal, ...pinned]
  }, [content.modules, editor?.isEditing])

  return (
    <div style={cssVars} className="min-h-screen bg-[var(--p-bg)] font-sans text-[var(--p-text)]">
      {orderedModules.map((module) => {
        const Renderer = SECTION_RENDERERS[module.moduleType]
        if (!Renderer) return null
        return <Renderer key={module.id} content={content} module={module} editor={editor} />
      })}
    </div>
  )
}
