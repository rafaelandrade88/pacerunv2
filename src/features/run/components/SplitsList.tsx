'use client'
import { motion, AnimatePresence } from 'framer-motion'

import { Duration } from '@/domain/value-objects/Duration'
import { Pace } from '@/domain/value-objects/Pace'
import { useRunStore } from '@/features/run/store/runStore'

export function SplitsList() {
  const splits = useRunStore((s) => s.splits)
  if (splits.length === 0) return null
  return (
    <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-3">
      <h3 className="text-sm font-semibold">Splits</h3>
      <div className="grid grid-cols-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1"><span>Km</span><span className="text-center">Tempo</span><span className="text-right">Pace</span></div>
      <div className="space-y-1">
        <AnimatePresence>
          {splits.map((split) => {
            const pace = Pace.fromSecondsPerKm(split.pace)
            const duration = Duration.fromSeconds(split.duration)
            return (
              <motion.div key={split.kilometer} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-3 text-sm px-1 py-2 rounded-lg bg-muted/30">
                <span className="font-semibold">{split.kilometer}</span>
                <span className="text-center text-muted-foreground">{duration.format()}</span>
                <span className="text-right font-bold text-primary">{pace.format()}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
