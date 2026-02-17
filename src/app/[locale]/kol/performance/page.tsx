import { setRequestLocale } from 'next-intl/server'
import { PerformancePage } from '@/components/kol'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function KolPerformancePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <PerformancePage />
}
