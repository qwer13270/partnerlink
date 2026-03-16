import strings from '@/lib/strings'
import { ReferralsTable } from '@/components/admin'

export default function AdminReferralsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif">{strings.admin.referrals.title}</h1>
        <p className="text-sm text-muted-foreground mt-2">{strings.admin.referrals.subtitle}</p>
      </div>
      <ReferralsTable />
    </div>
  )
}
