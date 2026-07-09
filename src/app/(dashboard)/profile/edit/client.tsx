'use client'
import { Skeleton } from '@/components/ui/skeleton'
import { ProfileEditForm } from '@/features/profile/components/ProfileEditForm'
import { useProfile } from '@/features/profile/hooks/useProfile'

export function ProfileEditClient() {
  const { data: profile, isLoading } = useProfile()
  if (isLoading) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
  if (!profile) return <p className="text-sm text-destructive">Perfil não encontrado.</p>
  return <ProfileEditForm profile={profile} />
}
