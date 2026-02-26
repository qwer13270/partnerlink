import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { KolsPerformance } from '@/components/merchant'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function MerchantKolsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <MerchantKolsContent />
}

function MerchantKolsContent() {
  const t = useTranslations('merchant.kolPerformance')

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
