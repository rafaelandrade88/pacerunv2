'use client'
import { Plus, Trophy } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import type { Achievement } from '@/domain/entities/Achievement'
import { AchievementCard } from '@/features/achievements/components/AchievementCard'
import { AchievementDetailModal } from '@/features/achievements/components/AchievementDetailModal'
import { AddAchievementModal } from '@/features/achievements/components/AddAchievementModal'
import { useAchievements } from '@/features/achievements/hooks/useAchievements'

export default function ConquistasPage() {
  const { data: achievements, isLoading } = useAchievements()
  const [addOpen, setAddOpen] = useState(false)
  const [selected, setSelected] = useState<Achievement | null>(null)

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Minhas Conquistas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registre suas corridas de rua e celebre cada vitória
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/40 bg-card animate-pulse">
                <div className="h-40 bg-muted rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-10 bg-muted rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : !achievements?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Nenhuma conquista ainda</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Adicione sua primeira corrida de rua e comece a construir seu histórico de conquistas.
            </p>
            <Button onClick={() => setAddOpen(true)} className="mt-6 gap-2">
              <Plus className="h-4 w-4" />
              Adicionar primeira conquista
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement, i) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  index={i}
                  onClick={setSelected}
                />
              ))}
            </div>
            <div className="flex justify-center pt-2">
              <Button onClick={() => setAddOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar conquista
              </Button>
            </div>
          </>
        )}
      </div>

      <AddAchievementModal open={addOpen} onClose={() => setAddOpen(false)} />
      <AchievementDetailModal achievement={selected} onClose={() => setSelected(null)} />
    </>
  )
}
