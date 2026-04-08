'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Field, Input } from '../_ui'
import type { PanelProps } from '../_types'

export function ShopProductsPanel({ project, module, onModuleChange }: PanelProps) {
  return (
    <div className="space-y-5">
      <Field label="區塊標題">
        <Input
          value={module.settings.title ?? ''}
          onChange={(e) => onModuleChange(module.id, (m) => ({ ...m, settings: { ...m.settings, title: e.target.value } }))}
          placeholder="精選商品"
        />
      </Field>
      <Link
        href={`/merchant/projects/${project.id}/products`}
        className="flex w-full items-center justify-between rounded-md border border-foreground/15 bg-foreground/[0.03] px-4 py-3 text-left transition-colors hover:border-foreground/30 hover:bg-foreground/[0.06]"
      >
        <div>
          <p className="text-[0.8rem] font-medium text-foreground">管理商品</p>
          <p className="mt-0.5 text-xs text-muted-foreground/60">新增、編輯、上傳商品圖片</p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
      </Link>
    </div>
  )
}
