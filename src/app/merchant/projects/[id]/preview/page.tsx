'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import TongchuangWingPage from '@/components/property/TongchuangWingPage'
import type { TongchuangTemplateContent } from '@/lib/property-template'

type PreviewProject = {
  id: string
  name: string
  publishStatus: 'draft' | 'published'
  slug: string
  template: TongchuangTemplateContent
}

export default function MerchantProjectPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<PreviewProject | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadProject() {
      setLoading(true)
      const response = await fetch(`/api/merchant/projects/${id}`, { cache: 'no-store' })
      const payload = await response.json().catch(() => ({}))

      if (!active) return

      if (!response.ok) {
        toast.error(payload.error ?? '載入預覽失敗')
        setLoading(false)
        return
      }

      setProject(payload.project ?? null)
      setLoading(false)
    }

    void loadProject()

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">載入預覽中…</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">找不到這個商案。</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-y-auto">
      <div className="sticky top-0 z-[110] flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/75 px-6 py-4 backdrop-blur-md lg:px-10">
        <div className="flex items-center gap-3 text-white">
          <Link
            href="/merchant/projects"
            className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors duration-150"
          >
            <ArrowLeft className="w-3 h-3" />
            返回商案
          </Link>
          <span className={`text-[0.6rem] uppercase tracking-widest px-1.5 py-0.5 border ${project.publishStatus === 'published' ? 'text-emerald-200 border-emerald-300/40 bg-emerald-500/10' : 'text-amber-200 border-amber-300/40 bg-amber-500/10'}`}>
            {project.publishStatus === 'published' ? '已發布' : '草稿預覽'}
          </span>
          <span className="hidden md:inline text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
            {project.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/merchant/projects/${id}/edit`}
            className="text-[0.65rem] uppercase tracking-widest text-white/80 border border-white/20 px-3 py-2 hover:border-white/50 hover:text-white transition-colors duration-150"
          >
            編輯內容
          </Link>
          {project.publishStatus === 'published' && (
            <Link
              href={`/properties/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest border border-white px-3 py-2 text-white hover:bg-white hover:text-black transition-colors duration-150"
            >
              公開頁面
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      <div className="min-h-screen bg-black">
        <TongchuangWingPage content={project.template} />
      </div>
    </div>
  )
}
