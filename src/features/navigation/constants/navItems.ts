import { BarChart2, History, Play, Trophy, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem { label: string; href: string; icon: LucideIcon; exactMatch?: boolean; hideFromBottomNav?: boolean }

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: BarChart2, exactMatch: true },
  { label: 'Histórico', href: '/history', icon: History },
  { label: 'Correr', href: '/run', icon: Play },
  { label: 'Conquistas', href: '/conquistas', icon: Trophy, hideFromBottomNav: true },
  { label: 'Perfil', href: '/profile', icon: User },
]
