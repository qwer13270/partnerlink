import strings from '@/lib/strings'
import { SettingsPanels } from '@/components/admin'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif">{strings.admin.settings.title}</h1>
        <p className="text-sm text-muted-foreground mt-2">{strings.admin.settings.subtitle}</p>
      </div>
      <SettingsPanels />
    </div>
  )
}
