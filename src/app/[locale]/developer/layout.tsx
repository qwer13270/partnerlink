import { ReactNode } from 'react'
import { DeveloperDashboardLayout } from '@/components/developer'

type Props = {
  children: ReactNode
}

export default function DeveloperLayout({ children }: Props) {
  return <DeveloperDashboardLayout>{children}</DeveloperDashboardLayout>
}
