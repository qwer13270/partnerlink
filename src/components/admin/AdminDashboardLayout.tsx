'use client'

import { ReactNode } from 'react'
import { Menu, LayoutDashboard, UserPlus, Building2, Users, Store } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Sidebar, { MobileSidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

const sidebarItems = [
  { href: '/admin',                        labelKey: 'overview',             icon: LayoutDashboard },
  { href: '/admin/kol-applications',       labelKey: 'kolApplications',      icon: UserPlus        },
  { href: '/admin/merchant-applications',  labelKey: 'merchantApplications', icon: Building2       },
  { href: '/admin/kols',                   labelKey: 'kols',                 icon: Users           },
  { href: '/admin/merchants',              labelKey: 'merchants',            icon: Store           },
]

interface AdminDashboardLayoutProps {
  children: ReactNode
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  return (
    <div className="editorial-container-wide">
      <div className="flex min-h-screen">
        <Sidebar items={sidebarItems} translationNamespace="admin" />

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
            <MobileSidebar items={sidebarItems} translationNamespace="admin" />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
