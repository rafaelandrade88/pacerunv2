import { Suspense } from 'react'

import { BottomNav } from '@/features/navigation/components/BottomNav'
import { Sidebar } from '@/features/navigation/components/Sidebar'
import { AppHeader } from '@/shared/components/layout/AppHeader'
import { PageSkeleton } from '@/shared/components/layout/PageSkeleton'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <Sidebar />
      <div className="lg:pl-64">
        <AppHeader />
        <main id="conteudo">
          <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
