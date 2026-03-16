import strings from '@/lib/strings'
import { ActivityLog, OverviewStats, QuickActions } from '@/components/admin'

export default function AdminOverviewPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-serif">{strings.admin.overview.title}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {strings.admin.overview.subtitle}
        </p>
      </div>
      <OverviewStats />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <ActivityLog />
        <QuickActions />
      </div>
    </div>
  )
}
