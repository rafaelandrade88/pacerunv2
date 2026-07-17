import { Pencil } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'

import { ProfileClient } from './client'


export const metadata: Metadata = { title: 'Perfil' }

export default function ProfilePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Meu Perfil"
        subtitle="Suas estatísticas e conquistas"
        action={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            nativeButton={false}
            render={<Link href="/profile/edit"><Pencil className="h-3.5 w-3.5" />Editar</Link>}
          />
        }
      />
      <ProfileClient />
    </PageContainer>
  )
}
