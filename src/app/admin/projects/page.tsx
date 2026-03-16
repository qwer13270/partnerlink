import strings from '@/lib/strings'
import { ProjectsTable } from '@/components/admin'

export default function AdminProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif">{strings.admin.projects.title}</h1>
        <p className="text-sm text-muted-foreground mt-2">{strings.admin.projects.subtitle}</p>
      </div>
      <ProjectsTable />
    </div>
  )
}
