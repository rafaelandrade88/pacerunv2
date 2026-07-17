import type { Metadata } from 'next'
import { Suspense } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'

export const metadata: Metadata = { title: 'Editar Perfil' }

async function ProfileEditContent() {
  const { ProfileEditClient } = await import('./client')
  return <ProfileEditClient />
}

export default function ProfileEditPage() {
  return (
    <PageContainer className="max-w-lg">
      <PageHeader title="Editar perfil" subtitle="Atualize suas informações" />
      <Suspense fallback={<div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>}>
        <ProfileEditContent />
      </Suspense>
    </PageContainer>
  )
}
