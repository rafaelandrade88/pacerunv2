import { Dumbbell, Footprints, Medal, Mountain, PersonStanding } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ActivityType } from '@/domain/entities/Activity'

// Fonte única para label, ícone e cor de cada tipo de atividade.
// Ícones Lucide (não emojis): renderização idêntica em qualquer sistema.
export const ACTIVITY_TYPE_META: Record<ActivityType, { label: string; icon: LucideIcon; colorClass: string }> = {
  run: { label: 'Corrida', icon: Footprints, colorClass: 'text-primary' },
  walk: { label: 'Caminhada', icon: PersonStanding, colorClass: 'text-sky-500' },
  trail: { label: 'Trail', icon: Mountain, colorClass: 'text-amber-500' },
  treadmill: { label: 'Esteira', icon: Dumbbell, colorClass: 'text-violet-500' },
}

export const ALL_ACTIVITIES_ICON: LucideIcon = Medal
