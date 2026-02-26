import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { ActivityLog, OverviewStats, QuickActions } from '@/components/admin'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function AdminOverviewPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <AdminOverviewContent />
}

function AdminOverviewContent() {
  const t = useTranslations('admin.overview')

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-serif">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {t('subtitle')}
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
