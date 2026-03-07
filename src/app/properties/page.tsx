'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Train, ArrowUpRight } from 'lucide-react'
import { mockProperties } from '@/data'
import type { Property } from '@/lib/types'

// ── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  'pre-sale': { label: '預售中', color: '#c4913a',  bg: 'rgba(196,145,58,0.12)',  border: 'rgba(196,145,58,0.25)' },
  'selling':  { label: '銷售中', color: '#4a9e6e',  bg: 'rgba(74,158,110,0.12)', border: 'rgba(74,158,110,0.25)'  },
  'sold-out': { label: '售完',   color: '#888888',  bg: 'rgba(0,0,0,0.07)',       border: 'rgba(0,0,0,0.12)'       },
  'completed':{ label: '完工',   color: '#888888',  bg: 'rgba(0,0,0,0.07)',       border: 'rgba(0,0,0,0.12)'       },
} as const

const IMAGES = [
  '/images/placeholders/hero/hero-1.webp',
  '/images/placeholders/hero/hero-2.webp',
  '/images/placeholders/hero/hero-3.webp',
]

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
})

// ── Property Card ─────────────────────────────────────────────────────────────
function PropertyCard({
  property,
  imgSrc,
  featured = false,
}: {
  property: Property
  imgSrc: string
  featured?: boolean
}) {
  const status = STATUS[property.status as keyof typeof STATUS] ?? STATUS['pre-sale']

  return (
    <Link href={`/properties/${property.slug}`} className="group block h-full">
      <div
        className="h-full overflow-hidden border border-black/10 transition-all duration-300 group-hover:border-[#c4913a]/30 group-hover:shadow-xl"
        style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
      >
        {/* ── Image ── */}
        <div className={`relative overflow-hidden ${featured ? 'h-72 md:h-96' : 'h-56'}`}>
          <Image
            src={imgSrc}
            alt={property.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Bottom gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(15,15,15,0.45) 0%, transparent 55%)' }}
          />

          {/* Status pill */}
          <div
            className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 text-[0.63rem] tracking-[1.5px] uppercase"
            style={{
              background: status.bg,
              color: status.color,
              border: `1px solid ${status.border}`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
            {status.label}
          </div>

          {/* Floors tag */}
          <div
            className="absolute top-4 right-4 text-[0.62rem] tracking-wide px-2.5 py-1"
            style={{
              background: 'rgba(15,15,15,0.5)',
              backdropFilter: 'blur(10px)',
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            {property.floors}F · {property.totalUnits}戶
          </div>

          {/* Bottom-left: name overlay on featured */}
          {featured && (
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div
                className="text-[0.62rem] tracking-[2.5px] uppercase mb-1.5"
                style={{ color: '#e8c98a' }}
              >
                {property.merchant}
              </div>
              <h2 className="font-serif text-2xl font-light text-white leading-tight">
                {property.name}
              </h2>
            </div>
          )}
        </div>

        {/* ── Info panel ── */}
        <div className="p-6" style={{ background: 'hsl(var(--background))' }}>
          {/* Non-featured: merchant + name in panel */}
          {!featured && (
            <>
              <div
                className="text-[0.62rem] tracking-[2.5px] uppercase mb-2"
                style={{ color: '#c4913a' }}
              >
                {property.merchant}
              </div>
              <h2 className="font-serif text-lg font-light leading-snug mb-4 text-foreground">
                {property.name}
              </h2>
            </>
          )}

          {/* Featured: name+merchant shown in image overlay, just add spacing */}
          {featured && <div className="mb-1" />}

          {/* Location + MRT */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" style={{ color: '#c4913a' }} />
              <span>{property.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Train className="w-3 h-3 shrink-0" style={{ color: '#c4913a' }} />
              <span>{property.nearestMrt} · 步行 {property.mrtWalkTime} 分</span>
            </div>
          </div>

          {/* Divider + Price + CTA */}
          <div
            className="flex items-end justify-between pt-4"
            style={{ borderTop: '1px solid rgba(26,26,26,0.08)' }}
          >
            <div>
              <div className="text-[0.6rem] tracking-[1.5px] uppercase text-muted-foreground mb-0.5">
                起始價格
              </div>
              <div className="font-serif font-light" style={{ color: '#c4913a' }}>
                <span className={featured ? 'text-xl' : 'text-lg'}>
                  NT${property.priceRange.min.toLocaleString()}
                </span>
                <span className="text-sm">萬起</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[0.65rem] tracking-wide text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
              <span>查看詳情</span>
              <ArrowUpRight
                className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PropertiesPage() {
  const [featured, ...rest] = mockProperties

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>

      {/* ── PAGE HEADER ── */}
      <section className="px-10 md:px-20 pt-20 pb-14 max-w-7xl mx-auto">
        <motion.div {...fadeUp(0.1)} className="flex items-center gap-3 mb-6">
          <div className="w-8 h-px" style={{ background: '#c4913a' }} />
          <span
            className="text-[0.68rem] tracking-[3px] uppercase"
            style={{ color: '#c4913a' }}
          >
            精選建案
          </span>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_auto] gap-10 items-end">
          <motion.h1
            {...fadeUp(0.2)}
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1]"
          >
            台灣優質<br />
            <span style={{ color: '#b8936a' }}>精選建案</span>
          </motion.h1>

          <motion.div {...fadeUp(0.3)} className="flex gap-10 pb-2">
            {[
              { num: `${mockProperties.length}`, sup: '個', label: '精選建案' },
              { num: '4',   sup: '個', label: '城市' },
              { num: '120', sup: '+',  label: '合作 KOL' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-serif text-[2rem] font-light leading-none">
                  {s.num}
                  <sup className="text-sm" style={{ color: '#c4913a' }}>{s.sup}</sup>
                </div>
                <div className="text-[0.63rem] tracking-[2px] uppercase text-muted-foreground mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PROPERTIES GRID ── */}
      <section className="px-10 md:px-20 pb-28 max-w-7xl mx-auto">

        {/* Row 1: featured (2/3) + second card (1/3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <PropertyCard property={featured} imgSrc={IMAGES[0]} featured />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <PropertyCard property={rest[0]} imgSrc={IMAGES[1]} />
          </motion.div>
        </div>

        {/* Row 2: remaining 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rest.slice(1).map((property, i) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <PropertyCard
                property={property}
                imgSrc={IMAGES[(i + 2) % IMAGES.length]}
              />
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  )
}
