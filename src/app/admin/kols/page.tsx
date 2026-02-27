import { useTranslations } from 'next-intl'
import { KolsTable } from '@/components/admin'

export default function AdminKolsPage() {
  return <KolsPageContent />
}

function KolsPageContent() {
  const t = useTranslations('admin.kols')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>
      <KolsTable />
    </div>
  )
}
