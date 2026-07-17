'use client'
import { motion } from 'framer-motion'
import { ArrowRight, Footprints } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import type { Activity } from '@/domain/entities/Activity'
import { ActivityCard } from '@/features/dashboard/components/ActivityCard'

interface RecentActivitiesProps { activities?: Activity[]; loading?: boolean }

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted"><Footprints className="h-8 w-8 text-muted-foreground" /></div>
      <div className="space-y-1"><p className="text-sm font-medium">Nenhuma atividade ainda</p><p className="text-xs text-muted-foreground">Inicie sua primeira corrida e ela aparecerá aqui</p></div>
      <Button size="sm" nativeButton={false} render={<Link href="/run">Iniciar corrida</Link>} />
    </motion.div>
  )
}

export function RecentActivities({ activities, loading = false }: RecentActivitiesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Atividades recentes</h3>
        {!loading && activities && activities.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            nativeButton={false}
            render={<Link href="/history">Ver todas<ArrowRight className="h-3 w-3" /></Link>}
          />
        )}
      </div>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <ActivityCard key={i} loading />)}</div>
      ) : !activities || activities.length === 0 ? <EmptyState /> : (
        <div className="space-y-3">{activities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}</div>
      )}
    </div>
  )
}
