import type { Metadata } from 'next'
import { Suspense } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { PageContainer } from '@/shared/components/layout/PageContainer'

export const metadata: Metadata = { title: 'Editar Perfil' }

async function ProfileEditContent() {
  const { ProfileEditClient } = await import('./client')
  return <ProfileEditClient />
}

export default function ProfileEditPage() {
  return (
    <PageContainer className="max-w-lg">
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Editar perfil</h2>
        <p className="text-sm text-muted-foreground">Atualize suas informações</p>
      </div>
      <Suspense fallback={<div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>}>
        <ProfileEditContent />
      </Suspense>
    </PageContainer>
  )
}
