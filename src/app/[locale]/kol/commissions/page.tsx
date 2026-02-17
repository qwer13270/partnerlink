import { setRequestLocale } from 'next-intl/server'
import { CommissionsPage } from '@/components/kol'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function KolCommissionsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <CommissionsPage />
}
