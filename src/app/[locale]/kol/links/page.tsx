import { setRequestLocale } from 'next-intl/server'
import { LinksPage } from '@/components/kol'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function KolLinksPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <LinksPage />
}
