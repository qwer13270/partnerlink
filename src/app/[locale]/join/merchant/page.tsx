import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function JoinMerchantPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <JoinMerchantContent />
}

function JoinMerchantContent() {
  const t = useTranslations('join.merchant')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>
    </div>
  )
}
