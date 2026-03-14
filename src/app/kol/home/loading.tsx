export default function KolHomeLoading() {
  return (
    <div className="space-y-10">
      {/* Greeting */}
      <div>
        <div className="mb-1 h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-9 w-48 animate-pulse rounded bg-muted" />
      </div>

      {/* Stats + application status row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col justify-between gap-6 border border-foreground/15 p-6">
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-3.5 animate-pulse rounded bg-muted" />
            </div>
            <div>
              <div className="h-10 w-16 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-2.5 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
      </div>

      {/* Property cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col border border-foreground/15">
            <div className="h-28 animate-pulse bg-muted" />
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-auto flex items-center justify-between border-t border-foreground/10 pt-2">
                <div className="h-7 w-14 animate-pulse rounded bg-muted" />
                <div className="h-4 w-10 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-9 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
