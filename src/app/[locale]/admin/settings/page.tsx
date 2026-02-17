import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { SettingsPanels } from '@/components/admin'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function AdminSettingsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <SettingsPageContent />
}

function SettingsPageContent() {
  const t = useTranslations('admin.settings')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>
      <SettingsPanels />
    </div>
  )
}
