'use client'

import { ReactNode } from 'react'
import { Menu, LayoutDashboard, Link2, LineChart, BadgeDollarSign } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Sidebar, { MobileSidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

const sidebarItems = [
  { href: '/kol', labelKey: 'overview', icon: LayoutDashboard },
  { href: '/kol/links', labelKey: 'myLinks', icon: Link2 },
  { href: '/kol/performance', labelKey: 'performance', icon: LineChart },
  { href: '/kol/commissions', labelKey: 'commissions', icon: BadgeDollarSign },
]

interface KOLDashboardLayoutProps {
  children: ReactNode
}

export default function KOLDashboardLayout({ children }: KOLDashboardLayoutProps) {
  return (
    <div className="editorial-container-wide">
      <div className="flex min-h-[calc(100vh-5rem)]">
        <Sidebar items={sidebarItems} translationNamespace="kol" />

        <div className="flex-1 min-w-0">
          <div className="py-10 lg:py-16 px-6 lg:pl-10 lg:pr-12">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Floating Menu */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <MobileSidebar items={sidebarItems} translationNamespace="kol" />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
