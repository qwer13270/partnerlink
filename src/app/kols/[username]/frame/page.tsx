'use client'

import { useState, useEffect } from 'react'
import type { KolResumeData } from '@/data/mock-resume'
import KolResumePage from '@/components/kol/KolResumePage'

export default function KolResumeFramePage() {
  const [resume, setResume] = useState<KolResumeData | null>(null)

  useEffect(() => {
    // Signal ready to parent editor
    window.parent.postMessage({ type: 'ready' }, '*')

    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'update' && e.data.resume) {
        setResume(e.data.resume as KolResumeData)
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  if (!resume) {
    return <div className="min-h-screen bg-[#0D0D0E]" />
  }

  return <KolResumePage resume={resume} viewerRole="public" previewMode />
}
