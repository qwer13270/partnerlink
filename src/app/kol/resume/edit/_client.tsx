'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import KolResumeEditor from '@/components/kol/KolResumeEditor'
import type { KolResumeData } from '@/data/mock-resume'

export default function KolResumeEditClient({
  initialResume,
}: {
  initialResume: KolResumeData
}) {
  const router = useRouter()
  const [resume, setResume] = useState(initialResume)

  return (
    <KolResumeEditor
      resume={resume}
      onClose={() => router.push('/kol/resume')}
      onSave={(updated) => setResume(updated)}
    />
  )
}
