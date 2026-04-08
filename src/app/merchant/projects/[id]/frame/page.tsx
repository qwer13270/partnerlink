'use client'

import { useEffect, useState } from 'react'
import TongchuangWingPage from '@/components/property/TongchuangWingPage'
import ShangAnPage from '@/components/property/ShangAnPage'
import type { TongchuangTemplateContent, ShangAnTemplateContent } from '@/lib/property-template'

type TemplateContent = TongchuangTemplateContent | ShangAnTemplateContent

type IncomingMessage =
  | { type: 'update'; content: TemplateContent; selectedModuleId: string | null }
  | { type: 'scroll'; moduleId: string }

export default function ProjectFramePage() {
  const [content, setContent] = useState<TemplateContent | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)

  useEffect(() => {
    // Tell the parent we're ready to receive content
    window.parent.postMessage({ type: 'ready' }, '*')

    function handler(e: MessageEvent) {
      const msg = e.data as IncomingMessage
      if (!msg?.type) return

      if (msg.type === 'update') {
        setContent(msg.content)
        setSelectedModuleId(msg.selectedModuleId)
      } else if (msg.type === 'scroll') {
        const el = document.querySelector<HTMLElement>(`[data-module-id="${msg.moduleId}"]`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const editorProps = {
    isEditing: true,
    selectedModuleId,
    onModuleSelect: (moduleId: string) => {
      window.parent.postMessage({ type: 'select', moduleId }, '*')
    },
  }

  return (
    // fixed inset-0 escapes the merchant layout wrapper
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0D0D0E]">
      {content ? (
        content.templateKey === 'shop' ? (
          <ShangAnPage content={content} editor={editorProps} />
        ) : (
          <TongchuangWingPage content={content} editor={editorProps} />
        )
      ) : (
        <div className="min-h-screen bg-[#0D0D0E]" />
      )}
    </div>
  )
}
