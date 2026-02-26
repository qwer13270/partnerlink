import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { MerchantStats, ProjectPerformanceCards, RecentLeads } from '@/components/merchant'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function MerchantOverviewPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <MerchantOverviewContent />
}

function MerchantOverviewContent() {
  const t = useTranslations('merchant.overview')

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-serif">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>

      <MerchantStats />

      <div>
        <h2 className="text-2xl font-serif mb-4">{t('projectsTitle')}</h2>
        <ProjectPerformanceCards />
      </div>

      <RecentLeads />
    </div>
  )
}
