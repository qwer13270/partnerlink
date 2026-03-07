'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, ImagePlus, X } from 'lucide-react'
import { toast } from 'sonner'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
})

// ── Input styles ──────────────────────────────────────────────────────────
const inputClass =
  'w-full text-sm bg-transparent px-3 py-2.5 outline-none placeholder:text-muted-foreground/50 transition-colors duration-150'

const fieldWrap = {
  border: '1px solid rgba(26,26,26,0.14)',
  background: 'hsl(var(--background))',
}

const fieldFocus = {
  border: '1px solid rgba(26,26,26,0.4)',
}

// ── Unit type row ────────────────────────────────────────────────────────────
function UnitRow({
  unit,
  onRemove,
}: {
  unit: { type: string; rooms: string; size: string; price: string }
  onRemove: () => void
}) {
  return (
    <div
      className="grid grid-cols-4 gap-2 items-center py-3"
      style={{ borderBottom: '1px solid rgba(26,26,26,0.06)' }}
    >
      {[unit.type, unit.rooms, unit.size, unit.price].map((v, i) => (
        <p key={i} className="text-sm">{v}</p>
      ))}
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground transition-colors duration-150 justify-self-end col-span-4"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({
  label,
  children,
  delay = 0,
}: {
  label: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div {...fadeUp(delay)}>
      <label className="block text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground mb-2">
        {label}
      </label>
      {children}
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>()

  const [form, setForm] = useState({
    name: id === 'prop-001' ? '璞真建設 — 光河' : '潤泰敦峰',
    location: id === 'prop-001' ? '新北市板橋區' : '台北市大安區',
    nearestMrt: id === 'prop-001' ? '板橋站' : '信義安和站',
    mrtWalkTime: id === 'prop-001' ? '8' : '5',
    priceMin: id === 'prop-001' ? '1680' : '3800',
    priceMax: id === 'prop-001' ? '3200' : '7200',
    floors: id === 'prop-001' ? '28' : '32',
    totalUnits: id === 'prop-001' ? '168' : '96',
    completionDate: id === 'prop-001' ? '2027-Q4' : '2026-Q2',
    commissionRate: id === 'prop-001' ? '3.5' : '4.2',
    description: id === 'prop-001'
      ? '璞真光河坐落新北市板橋區，鄰近板橋車站，交通便捷，規劃 168 戶精品住宅，屋高 3 米、大面寬設計，打造城市優質宅邸。'
      : '潤泰敦峰位於台北市大安區核心地帶，以精品豪宅定位，享受都心成熟生活機能與優質學區環境。',
  })

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = () => {
    toast.success('商案資訊已更新', { description: '變更已儲存成功。' })
  }

  return (
    <div className="max-w-2xl space-y-10">

      {/* ── Back ── */}
      <motion.div {...fadeUp(0)}>
        <Link
          href={`/merchant/projects/${id}`}
          className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <ArrowLeft className="w-3 h-3" />
          返回商案
        </Link>
      </motion.div>

      {/* ── Title ── */}
      <motion.div {...fadeUp(0.05)}>
        <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground mb-1">編輯商案</p>
        <h1 className="text-3xl font-serif font-light">{form.name}</h1>
      </motion.div>

      {/* ── Section: 基本資訊 ── */}
      <div className="space-y-5">
        <motion.p {...fadeUp(0.1)} className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground pb-2" style={{ borderBottom: '1px solid rgba(26,26,26,0.08)' }}>
          基本資訊
        </motion.p>

        <Field label="商案名稱" delay={0.12}>
          <div style={fieldWrap} className="focus-within:border-foreground/40 transition-colors duration-150">
            <input
              className={inputClass}
              value={form.name}
              onChange={set('name')}
              placeholder="商案名稱"
            />
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="地址 / 區域" delay={0.14}>
            <div style={fieldWrap} className="focus-within:border-foreground/40 transition-colors duration-150">
              <input className={inputClass} value={form.location} onChange={set('location')} placeholder="如：新北市板橋區" />
            </div>
          </Field>
          <Field label="預計完工" delay={0.14}>
            <div style={fieldWrap} className="focus-within:border-foreground/40 transition-colors duration-150">
              <input className={inputClass} value={form.completionDate} onChange={set('completionDate')} placeholder="如：2027-Q4" />
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="最近捷運" delay={0.16}>
            <div style={fieldWrap} className="focus-within:border-foreground/40 transition-colors duration-150">
              <input className={inputClass} value={form.nearestMrt} onChange={set('nearestMrt')} placeholder="捷運站名" />
            </div>
          </Field>
          <Field label="步行時間 (分)" delay={0.16}>
            <div style={fieldWrap} className="focus-within:border-foreground/40 transition-colors duration-150">
              <input className={inputClass} type="number" value={form.mrtWalkTime} onChange={set('mrtWalkTime')} placeholder="8" />
            </div>
          </Field>
          <Field label="佣金比率 (%)" delay={0.16}>
            <div style={fieldWrap} className="focus-within:border-foreground/40 transition-colors duration-150">
              <input className={inputClass} type="number" step="0.1" value={form.commissionRate} onChange={set('commissionRate')} placeholder="3.5" />
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="樓層數" delay={0.18}>
            <div style={fieldWrap} className="focus-within:border-foreground/40 transition-colors duration-150">
              <input className={inputClass} type="number" value={form.floors} onChange={set('floors')} placeholder="28" />
            </div>
          </Field>
          <Field label="總戶數" delay={0.18}>
            <div style={fieldWrap} className="focus-within:border-foreground/40 transition-colors duration-150">
              <input className={inputClass} type="number" value={form.totalUnits} onChange={set('totalUnits')} placeholder="168" />
            </div>
          </Field>
        </div>
      </div>

      {/* ── Section: 定價 ── */}
      <div className="space-y-5">
        <motion.p {...fadeUp(0.2)} className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground pb-2" style={{ borderBottom: '1px solid rgba(26,26,26,0.08)' }}>
          售價範圍（萬）
        </motion.p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="最低售價 (萬)" delay={0.22}>
            <div style={fieldWrap} className="focus-within:border-foreground/40 transition-colors duration-150">
              <input className={inputClass} type="number" value={form.priceMin} onChange={set('priceMin')} placeholder="1680" />
            </div>
          </Field>
          <Field label="最高售價 (萬)" delay={0.22}>
            <div style={fieldWrap} className="focus-within:border-foreground/40 transition-colors duration-150">
              <input className={inputClass} type="number" value={form.priceMax} onChange={set('priceMax')} placeholder="3200" />
            </div>
          </Field>
        </div>
      </div>

      {/* ── Section: 商案描述 ── */}
      <div className="space-y-5">
        <motion.p {...fadeUp(0.24)} className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground pb-2" style={{ borderBottom: '1px solid rgba(26,26,26,0.08)' }}>
          商案描述
        </motion.p>
        <Field label="簡介" delay={0.26}>
          <div style={fieldWrap} className="focus-within:border-foreground/40 transition-colors duration-150">
            <textarea
              className={`${inputClass} resize-none`}
              rows={4}
              value={form.description}
              onChange={set('description')}
              placeholder="商案簡介文字..."
            />
          </div>
        </Field>
      </div>

      {/* ── Section: 圖片 ── */}
      <div className="space-y-5">
        <motion.p {...fadeUp(0.28)} className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground pb-2" style={{ borderBottom: '1px solid rgba(26,26,26,0.08)' }}>
          圖片管理
        </motion.p>
        <motion.div {...fadeUp(0.3)}>
          <div
            className="flex flex-col items-center justify-center gap-3 py-10 cursor-pointer hover:opacity-70 transition-opacity duration-150"
            style={{ border: '1.5px dashed rgba(26,26,26,0.2)' }}
            onClick={() => toast.info('圖片上傳功能開發中')}
          >
            <ImagePlus className="w-7 h-7 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">點擊上傳商案圖片</p>
            <p className="text-[0.6rem] text-muted-foreground/60 uppercase tracking-widest">PNG · JPG · WEBP · 最大 10MB</p>
          </div>
        </motion.div>
      </div>

      {/* ── Save button ── */}
      <motion.div {...fadeUp(0.34)} className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-widest bg-foreground text-background px-5 py-2.5 hover:opacity-80 transition-opacity duration-150"
        >
          <Save className="w-3.5 h-3.5" />
          儲存變更
        </button>
        <Link
          href={`/merchant/projects/${id}`}
          className="text-[0.65rem] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          取消
        </Link>
      </motion.div>

    </div>
  )
}
