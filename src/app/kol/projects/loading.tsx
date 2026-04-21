export default function Loading() {
  return (
    <div className="space-y-10 text-white animate-pulse">
      <div>
        <div className="h-2.5 w-24 bg-white/10 rounded mb-4" />
        <div className="h-10 w-64 bg-white/10 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="liquid-glass !rounded-[22px] p-6 h-[160px]" />
        ))}
      </div>
      <div className="liquid-glass !rounded-[22px] divide-y divide-white/5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="px-5 py-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-white/10 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-48 bg-white/10 rounded" />
              <div className="h-2.5 w-32 bg-white/[0.06] rounded" />
            </div>
            <div className="h-6 w-16 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
