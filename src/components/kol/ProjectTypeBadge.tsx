import { cn } from '@/lib/utils'

type ProjectType = 'property' | 'shop' | null | undefined

interface Props {
  type: ProjectType
  className?: string
}

export default function ProjectTypeBadge({ type, className }: Props) {
  const style =
    type === 'property'
      ? 'border-stone-200/30 bg-stone-300/10 text-stone-200'
      : type === 'shop'
      ? 'border-violet-200/30 bg-violet-300/10 text-violet-200'
      : 'border-white/15 bg-white/5 text-white/50'

  return (
    <span
      className={cn(
        'text-[0.6rem] font-mono uppercase tracking-[0.3em] px-1.5 py-0.5 border',
        style,
        className,
      )}
    >
      {type ?? '—'}
    </span>
  )
}
