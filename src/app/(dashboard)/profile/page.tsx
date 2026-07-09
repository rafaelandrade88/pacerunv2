import { Pencil } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { PageContainer } from '@/shared/components/layout/PageContainer'

import { ProfileClient } from './client'


export const metadata: Metadata = { title: 'Perfil' }

export default function ProfilePage() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Meu Perfil</h2>
          <p className="text-sm text-muted-foreground">Suas estatísticas e conquistas</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          nativeButton={false}
          render={<Link href="/profile/edit"><Pencil className="h-3.5 w-3.5" />Editar</Link>}
        />
      </div>
      <ProfileClient />
    </PageContainer>
  )
}
