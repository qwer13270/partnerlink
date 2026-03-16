'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import strings from '@/lib/strings'

export default function SettingsPanels() {
  const t = strings.admin.settings

  const panels = [
    { title: t.commissionStructure, body: t.commissionStructureBody },
    { title: t.platformBranding,    body: t.platformBrandingBody    },
    { title: t.notifications,       body: t.notificationsBody       },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {panels.map((panel) => (
        <Card key={panel.title} className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-serif">{panel.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{panel.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
