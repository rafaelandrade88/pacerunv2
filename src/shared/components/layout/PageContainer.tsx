import { cn } from '@/lib/utils'

interface PageContainerProps { children: React.ReactNode; className?: string }

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={cn('min-h-[calc(100vh-4rem)] px-4 py-6 lg:px-8 pb-24 lg:pb-8 max-w-5xl mx-auto w-full', className)}>
      {children}
    </main>
  )
}
