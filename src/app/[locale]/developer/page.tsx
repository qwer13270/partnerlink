import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { DeveloperStats, ProjectPerformanceCards, RecentLeads } from '@/components/developer'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function DeveloperOverviewPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <DeveloperOverviewContent />
}

function DeveloperOverviewContent() {
  const t = useTranslations('developer.overview')

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-serif">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>

      <DeveloperStats />

      <div>
        <h2 className="text-2xl font-serif mb-4">{t('projectsTitle')}</h2>
        <ProjectPerformanceCards />
      </div>

      <RecentLeads />
    </div>
  )
}
