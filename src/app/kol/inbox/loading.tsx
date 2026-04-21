export default function Loading() {
  return (
    <div className="space-y-10 text-white animate-pulse">
      <div>
        <div className="h-2.5 w-24 bg-white/10 rounded mb-4" />
        <div className="h-10 w-56 bg-white/10 rounded" />
        <div className="mt-4 h-3 w-80 bg-white/[0.06] rounded" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="liquid-glass rounded-2xl h-[96px]" />
        ))}
      </div>
      <div className="flex border-b border-white/10 gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-3 w-16 bg-white/10 rounded mb-3" />
        ))}
      </div>
      <div className="liquid-glass rounded-2xl overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="px-5 py-5 border-b border-white/[0.07] last:border-b-0 space-y-3">
            <div className="h-3 w-48 bg-white/10 rounded" />
            <div className="h-2.5 w-64 bg-white/[0.06] rounded" />
            <div className="h-8 w-28 bg-white/[0.08] rounded-full mt-3" />
          </div>
        ))}
      </div>
    </div>
  )
}
