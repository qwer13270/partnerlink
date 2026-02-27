import { useTranslations } from 'next-intl'
import { ProjectsTable } from '@/components/admin'

export default function AdminProjectsPage() {
  return <ProjectsPageContent />
}

function ProjectsPageContent() {
  const t = useTranslations('admin.projects')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>
      <ProjectsTable />
    </div>
  )
}
