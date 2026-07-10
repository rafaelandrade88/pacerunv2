'use client'
import { motion } from 'framer-motion'
import { ArrowRight, Medal } from 'lucide-react'
import Link from 'next/link'

import { Skeleton } from '@/components/ui/skeleton'
import { useAchievements } from '@/features/achievements/hooks/useAchievements'

export function RecentAchievements() {
  const { data: achievements, isLoading } = useAchievements()

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      </div>
    )
  }

  const recent = (achievements ?? []).slice(0, 3)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Medal className="h-4 w-4 text-muted-foreground" />
          Últimas conquistas
        </h3>
        {recent.length > 0 && (
          <Link href="/conquistas" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {recent.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Participou de uma prova? <Link href="/conquistas" className="text-primary hover:underline">Registre sua conquista</Link>.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {recent.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Link href="/conquistas" className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card p-4 transition-colors hover:border-border/70">
                {a.thumbnailBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.thumbnailBase64} alt="" className="h-11 w-11 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted shrink-0">
                    <Medal className="h-5 w-5 text-amber-500" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{a.eventName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[a.distance, a.eventDate].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
