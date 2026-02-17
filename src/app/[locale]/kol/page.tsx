import { setRequestLocale } from 'next-intl/server'
import { OverviewPage } from '@/components/kol'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function KolOverviewPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <OverviewPage />
}
