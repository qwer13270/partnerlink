import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { LeadsTable } from '@/components/developer'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function DeveloperLeadsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <DeveloperLeadsContent />
}

function DeveloperLeadsContent() {
  const t = useTranslations('developer.leads')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>
      <LeadsTable />
    </div>
  )
}
