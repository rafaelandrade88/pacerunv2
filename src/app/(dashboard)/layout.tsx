import { Suspense } from 'react'

import { BottomNav } from '@/features/navigation/components/BottomNav'
import { Sidebar } from '@/features/navigation/components/Sidebar'
import { AppHeader } from '@/shared/components/layout/AppHeader'
import { PageSkeleton } from '@/shared/components/layout/PageSkeleton'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <AppHeader />
        <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
      </div>
      <BottomNav />
    </div>
  )
}
