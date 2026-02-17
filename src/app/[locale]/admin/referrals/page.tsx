import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { ReferralsTable } from '@/components/admin'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function AdminReferralsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <ReferralsPageContent />
}

function ReferralsPageContent() {
  const t = useTranslations('admin.referrals')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>
      <ReferralsTable />
    </div>
  )
}
