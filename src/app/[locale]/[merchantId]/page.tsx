import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'

type Props = {
  params: Promise<{ locale: string; merchantId: string }>
}

export default async function MerchantPublicPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <MerchantPublicContent />
}

function MerchantPublicContent() {
  const t = useTranslations('merchantPage')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>
    </div>
  )
}
