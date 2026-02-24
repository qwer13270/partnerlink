'use client'

import { ReactNode } from 'react'
import { Menu, LayoutDashboard, Building2, ClipboardList, Users } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Sidebar, { MobileSidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

const sidebarItems = [
  { href: '/developer', labelKey: 'overview', icon: LayoutDashboard },
  { href: '/developer/projects', labelKey: 'projects', icon: Building2 },
  { href: '/developer/leads', labelKey: 'leads', icon: ClipboardList },
  { href: '/developer/kols', labelKey: 'kolPerformance', icon: Users },
]

interface DeveloperDashboardLayoutProps {
  children: ReactNode
}

export default function DeveloperDashboardLayout({ children }: DeveloperDashboardLayoutProps) {
  return (
    <div className="editorial-container-wide">
      <div className="flex min-h-[calc(100vh-5rem)]">
        <Sidebar items={sidebarItems} translationNamespace="developer" />

        <div className="flex-1 min-w-0">
          <div className="py-10 lg:py-16 px-6 lg:pl-10 lg:pr-12">
            {children}
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <MobileSidebar items={sidebarItems} translationNamespace="developer" />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
