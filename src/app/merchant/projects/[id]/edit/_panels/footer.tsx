'use client'

import { Field, Textarea } from '../_ui'
import type { PanelProps } from '../_types'

export function FooterPanel({ project, onFieldChange }: PanelProps) {
  return (
    <Field label="頁尾免責說明">
      <Textarea
        rows={6}
        value={project.footerDisclaimer}
        onChange={(e) => onFieldChange('footerDisclaimer', e.target.value)}
      />
    </Field>
  )
}
