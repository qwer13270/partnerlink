import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { KolsPerformance } from '@/components/developer'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function DeveloperKolsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <DeveloperKolsContent />
}

function DeveloperKolsContent() {
  const t = useTranslations('developer.kolPerformance')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>
      <KolsPerformance />
    </div>
  )
}
