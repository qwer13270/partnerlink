'use client'

import { useEffect, useState } from 'react'
import TongchuangWingPage from '@/components/property/TongchuangWingPage'
import type { TongchuangTemplateContent } from '@/lib/property-template'

type IncomingMessage =
  | { type: 'update'; content: TongchuangTemplateContent; selectedModuleId: string | null }
  | { type: 'scroll'; moduleId: string }

export default function ProjectFramePage() {
  const [content, setContent]               = useState<TongchuangTemplateContent | null>(null)
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

  return (
    // fixed inset-0 escapes the merchant layout wrapper
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0D0D0E]">
      {content ? (
        <TongchuangWingPage
          content={content}
          editor={{
            isEditing: true,
            selectedModuleId,
            onModuleSelect: (moduleId) => {
              window.parent.postMessage({ type: 'select', moduleId }, '*')
            },
          }}
        />
      ) : (
        <div className="min-h-screen bg-[#0D0D0E]" />
      )}
    </div>
  )
}
