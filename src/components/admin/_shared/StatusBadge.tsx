import { cn } from '@/lib/utils'

export type StatusVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

interface StatusBadgeProps {
  variant: StatusVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

const VARIANT_CLASSES: Record<StatusVariant, { border: string; text: string; dot: string }> = {
  success: { border: 'border-emerald-400/40', text: 'text-emerald-200',  dot: 'bg-emerald-400' },
  warning: { border: 'border-amber-400/40',   text: 'text-amber-200',    dot: 'bg-amber-300' },
  danger:  { border: 'border-red-400/40',     text: 'text-red-200',      dot: 'bg-red-400' },
  neutral: { border: 'border-white/15',       text: 'text-white/70',     dot: 'bg-white/60' },
  info:    { border: 'border-sky-400/40',     text: 'text-sky-200',      dot: 'bg-sky-400' },
}

export default function StatusBadge({ variant, children, className, dot = true }: StatusBadgeProps) {
  const v = VARIANT_CLASSES[variant]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border bg-white/[0.02] px-2.5 py-1 meta text-[10px] tracking-[0.14em]',
        v.border,
        v.text,
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', v.dot)} />}
      {children}
    </span>
  )
}
