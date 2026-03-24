'use client'

import { useState } from 'react'
import { ChevronDown, CheckCircle2, Clock, Circle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PropertyContentItem } from './_types'

// ── CSS constants ─────────────────────────────────────────────────────────────

export const inputBase = 'w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/40'
export const fieldWrap = 'rounded-md border border-foreground/15 bg-background transition-colors duration-150 focus-within:border-foreground/40'

// ── Primitive form components ─────────────────────────────────────────────────

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[0.6rem] text-muted-foreground/60">{hint}</p>}
    </div>
  )
}

export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={fieldWrap}>
      <input className={`${inputBase} ${className}`} {...props} />
    </div>
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={fieldWrap}>
      <textarea className={`${inputBase} resize-y`} {...props} />
    </div>
  )
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-0.5">
      <div className="h-px flex-1 bg-foreground/[0.07]" />
      <span className="shrink-0 text-[0.56rem] uppercase tracking-[0.25em] text-muted-foreground/50">
        {label}
      </span>
      <div className="h-px flex-1 bg-foreground/[0.07]" />
    </div>
  )
}

// ── State toggle ──────────────────────────────────────────────────────────────

const STATE_OPTIONS = [
  { value: 'completed', label: '已完成', Icon: CheckCircle2, active: 'text-emerald-700 border-emerald-300 bg-emerald-50' },
  { value: 'current',   label: '進行中', Icon: Clock,         active: 'text-blue-700 border-blue-300 bg-blue-50'           },
  { value: 'upcoming',  label: '未開始', Icon: Circle,        active: 'text-foreground/60 border-foreground/25 bg-muted/40' },
] as const

export function StateToggle({
  value,
  onChange,
}: {
  value: 'completed' | 'current' | 'upcoming'
  onChange: (value: 'completed' | 'current' | 'upcoming') => void
}) {
  return (
    <div className="flex gap-1">
      {STATE_OPTIONS.map(({ value: option, label, Icon, active }) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`flex flex-1 items-center justify-center gap-1 rounded-md border py-2 text-[0.6rem] uppercase tracking-widest transition-colors duration-150 ${
            value === option ? active : 'border-foreground/12 text-muted-foreground/60 hover:border-foreground/25'
          }`}
        >
          <Icon className="h-3 w-3 shrink-0" />
          {label}
        </button>
      ))}
    </div>
  )
}

// ── Repeatable fields (collapsible accordion) ─────────────────────────────────

export function RepeatableFields({
  items,
  groupKey,
  onContentItemChange,
  fieldLabels,
}: {
  items: PropertyContentItem[]
  groupKey: PropertyContentItem['groupKey']
  onContentItemChange: (index: number, key: keyof PropertyContentItem, value: string | null) => void
  fieldLabels: Partial<Record<'title' | 'body' | 'meta' | 'accent' | 'state', string>>
}) {
  const [expanded, setExpanded] = useState<number[]>([0])

  const groupItems = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.groupKey === groupKey)
    .sort((a, b) => a.item.sortOrder - b.item.sortOrder)

  function toggle(rowIndex: number) {
    setExpanded((prev) =>
      prev.includes(rowIndex) ? prev.filter((n) => n !== rowIndex) : [...prev, rowIndex],
    )
  }

  const isColorField = fieldLabels.accent === '顏色'

  return (
    <div className="space-y-1.5">
      {groupItems.map(({ item, index }, rowIndex) => {
        const isOpen = expanded.includes(rowIndex)
        const previewText = item.title ?? item.body ?? '—'

        return (
          <div
            key={`${item.groupKey}-${item.itemKey ?? rowIndex}`}
            className="overflow-hidden rounded-md border border-foreground/10"
          >
            <button
              type="button"
              onClick={() => toggle(rowIndex)}
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors duration-150 hover:bg-foreground/[0.03]"
            >
              <span className="w-4 shrink-0 font-mono text-[0.58rem] text-muted-foreground/50">
                {String(rowIndex + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 truncate text-xs text-foreground">{previewText}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 border-t border-foreground/[0.06] bg-foreground/[0.015] px-4 pb-4 pt-2">
                    {fieldLabels.accent && !isColorField && (
                      <Field label={fieldLabels.accent}>
                        <Input
                          value={item.accent ?? ''}
                          onChange={(e) => onContentItemChange(index, 'accent', e.target.value)}
                        />
                      </Field>
                    )}
                    {isColorField && (
                      <Field label="顏色" hint="色碼，例如 #C9A96E">
                        <div className="flex items-center gap-2">
                          <div
                            className="relative h-8 w-8 shrink-0 overflow-hidden rounded-sm border border-foreground/20"
                            style={{ backgroundColor: item.accent ?? '#C9A96E' }}
                          >
                            <input
                              type="color"
                              value={item.accent ?? '#C9A96E'}
                              onChange={(e) => onContentItemChange(index, 'accent', e.target.value)}
                              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            />
                          </div>
                          <Input
                            value={item.accent ?? ''}
                            onChange={(e) => onContentItemChange(index, 'accent', e.target.value)}
                          />
                        </div>
                      </Field>
                    )}
                    {fieldLabels.title && (
                      <Field label={fieldLabels.title}>
                        <Input
                          value={item.title ?? ''}
                          onChange={(e) => onContentItemChange(index, 'title', e.target.value)}
                        />
                      </Field>
                    )}
                    {fieldLabels.body && (
                      <Field label={fieldLabels.body}>
                        <Textarea
                          rows={2}
                          value={item.body ?? ''}
                          onChange={(e) => onContentItemChange(index, 'body', e.target.value)}
                        />
                      </Field>
                    )}
                    {fieldLabels.meta && (
                      <Field label={fieldLabels.meta}>
                        <Input
                          value={item.meta ?? ''}
                          onChange={(e) => onContentItemChange(index, 'meta', e.target.value)}
                        />
                      </Field>
                    )}
                    {fieldLabels.state && (
                      <Field label={fieldLabels.state}>
                        <StateToggle
                          value={item.state ?? 'upcoming'}
                          onChange={(v) => onContentItemChange(index, 'state', v)}
                        />
                      </Field>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
