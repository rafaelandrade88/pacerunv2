'use client'
import { PersonalRecords } from '@/features/profile/components/PersonalRecords'
import { ProfileHeader } from '@/features/profile/components/ProfileHeader'
import { ProfileStats } from '@/features/profile/components/ProfileStats'
import { RecentAchievements } from '@/features/profile/components/RecentAchievements'
import { useProfile } from '@/features/profile/hooks/useProfile'

export function ProfileClient() {
  const { data: profile, isLoading } = useProfile()
  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} loading={isLoading} />
      <ProfileStats profile={profile} loading={isLoading} />
      <PersonalRecords />
      <RecentAchievements />
    </div>
  )
}
