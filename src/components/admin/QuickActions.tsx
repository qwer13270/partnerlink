'use client'

import strings from '@/lib/strings'

export default function QuickActions() {
  const t = strings.admin.quickActions

  return (
    <div className="liquid-glass !rounded-[22px] p-6">
      <h3 className="font-heading italic text-[22px] text-white">{t.title}</h3>
      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" className="liquid-glass !rounded-full text-white/80 font-body text-[12px] px-4 py-2.5 hover:text-white hover:bg-white/[0.04] transition-colors">
          {t.addProject}
        </button>
        <button type="button" className="liquid-glass !rounded-full text-white/80 font-body text-[12px] px-4 py-2.5 hover:text-white hover:bg-white/[0.04] transition-colors">
          {t.inviteKol}
        </button>
        <button type="button" className="liquid-glass-strong !rounded-full text-white font-body font-medium text-[12px] px-4 py-2.5 hover:bg-white/[0.04] transition-colors">
          {t.exportReports}
        </button>
      </div>
    </div>
  )
}
