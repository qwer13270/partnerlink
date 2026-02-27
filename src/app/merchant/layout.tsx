import { ReactNode } from 'react'
import { MerchantDashboardLayout } from '@/components/merchant'

type Props = {
  children: ReactNode
}

export default function MerchantLayout({ children }: Props) {
  return <MerchantDashboardLayout>{children}</MerchantDashboardLayout>
}
