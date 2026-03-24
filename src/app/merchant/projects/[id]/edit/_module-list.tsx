'use client'

import { Eye, EyeOff, GripVertical, ChevronRight } from 'lucide-react'
import type { PropertyModule } from './_types'
import { MODULE_META } from './_types'

// ── Draggable list item (for reorderable modules) ─────────────────────────────

export function ModuleListItem({
  module,
  selected,
  onSelect,
  onToggleVisibility,
  onDragHandlePointerDown,
}: {
  module: PropertyModule
  selected: boolean
  onSelect: () => void
  onToggleVisibility: () => void
  onDragHandlePointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void
}) {
  const { label, Icon } = MODULE_META[module.moduleType]

  return (
    <div
      className={`group flex items-center gap-1 rounded-lg px-1 py-1 transition-colors duration-150 ${
        selected ? 'bg-foreground/[0.06]' : 'hover:bg-foreground/[0.03]'
      }`}
    >
      {/* Drag handle */}
      <div
        onPointerDown={onDragHandlePointerDown}
        style={{ touchAction: 'none' }}
        className="flex h-7 w-5 shrink-0 cursor-grab items-center justify-center text-muted-foreground/30 transition-colors duration-150 group-hover:text-muted-foreground/60 active:cursor-grabbing"
        aria-label="拖移排序"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>

      {/* Module icon */}
      <ModuleIcon Icon={Icon} selected={selected} />

      {/* Label + hidden indicator */}
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 py-1 text-left">
        <p className={`truncate text-[0.78rem] font-medium leading-snug transition-colors ${
          selected ? 'text-foreground' : 'text-foreground/70 group-hover:text-foreground'
        }`}>
          {label}
        </p>
        {!module.isVisible && <HiddenBadge />}
      </button>

      {/* Visibility toggle */}
      <VisibilityButton isVisible={module.isVisible} onToggle={(e) => { e.stopPropagation(); onToggleVisibility() }} />

      <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-colors duration-150 ${
        selected ? 'text-foreground/50' : 'text-muted-foreground/20 group-hover:text-muted-foreground/40'
      }`} />
    </div>
  )
}

// ── Pinned list item (fixed position, no drag handle) ─────────────────────────

export function PinnedModuleItem({
  module,
  selected,
  onSelect,
  onToggleVisibility,
}: {
  module: PropertyModule
  selected: boolean
  onSelect: () => void
  onToggleVisibility: () => void
}) {
  const { label, Icon } = MODULE_META[module.moduleType]

  return (
    <div className={`group flex items-center gap-1 rounded-lg px-1 py-1 transition-colors duration-150 ${
      selected ? 'bg-foreground/[0.06]' : 'hover:bg-foreground/[0.03]'
    }`}>
      {/* Spacer matching drag-handle width */}
      <div className="h-7 w-5 shrink-0" />

      <ModuleIcon Icon={Icon} selected={selected} />

      <button type="button" onClick={onSelect} className="min-w-0 flex-1 py-1 text-left">
        <p className={`truncate text-[0.78rem] font-medium leading-snug transition-colors ${
          selected ? 'text-foreground' : 'text-foreground/70 group-hover:text-foreground'
        }`}>
          {label}
        </p>
        {!module.isVisible && <HiddenBadge />}
      </button>

      <VisibilityButton isVisible={module.isVisible} onToggle={(e) => { e.stopPropagation(); onToggleVisibility() }} />

      <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-colors duration-150 ${
        selected ? 'text-foreground/50' : 'text-muted-foreground/20 group-hover:text-muted-foreground/40'
      }`} />
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function ModuleIcon({
  Icon,
  selected,
}: {
  Icon: React.FC<{ className?: string }>
  selected: boolean
}) {
  return (
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150 ${
      selected
        ? 'bg-foreground/10 text-foreground'
        : 'bg-foreground/[0.04] text-muted-foreground group-hover:bg-foreground/[0.06]'
    }`}>
      <Icon className="h-3.5 w-3.5" />
    </div>
  )
}

function HiddenBadge() {
  return (
    <p className="flex items-center gap-1 text-[0.58rem] text-muted-foreground/50">
      <EyeOff className="h-2.5 w-2.5" />
      已隱藏
    </p>
  )
}

function VisibilityButton({
  isVisible,
  onToggle,
}: {
  isVisible: boolean
  onToggle: (e: React.MouseEvent) => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-150 ${
        isVisible
          ? 'text-muted-foreground/30 hover:bg-foreground/[0.05] hover:text-muted-foreground'
          : 'text-amber-500/70 hover:bg-amber-50 hover:text-amber-600'
      }`}
      title={isVisible ? '點擊隱藏' : '點擊顯示'}
    >
      {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
    </button>
  )
}
