'use client'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserProfile } from '@/domain/entities/User'
import { AvatarUpload } from '@/features/profile/components/AvatarUpload'

interface ProfileHeaderProps { profile?: UserProfile | null; loading?: boolean }

export function ProfileHeader({ profile, loading = false }: ProfileHeaderProps) {
  if (loading) return (
    <div className="flex items-center gap-5 py-4">
      <Skeleton className="h-24 w-24 rounded-full shrink-0" />
      <div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-40" /></div>
    </div>
  )
  if (!profile) return null
  return (
    <div className="flex items-center gap-5 py-4">
      <AvatarUpload photoURL={profile.photoURL} displayName={profile.displayName} />
      <div className="space-y-1 min-w-0">
        <h2 className="text-xl font-bold truncate">{profile.displayName ?? 'Usuário'}</h2>
        <p className="text-sm text-muted-foreground">@{profile.username}</p>
        {profile.bio && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{profile.bio}</p>}
      </div>
    </div>
  )
}
