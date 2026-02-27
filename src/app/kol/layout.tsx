import { ReactNode } from 'react'
import { KOLDashboardLayout } from '@/components/kol'

type Props = {
  children: ReactNode
}

export default function KolLayout({ children }: Props) {
  return <KOLDashboardLayout>{children}</KOLDashboardLayout>
}
