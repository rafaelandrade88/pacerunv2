'use client'
import { motion } from 'framer-motion'
import { Calendar, ChevronRight, MapPin, Timer } from 'lucide-react'

import type { Achievement } from '@/domain/entities/Achievement'

interface AchievementCardProps {
  achievement: Achievement
  index?: number
  onClick: (achievement: Achievement) => void
}

export function AchievementCard({ achievement, index = 0, onClick }: AchievementCardProps) {
  const { eventName, eventDate, location, distance, category, netTime, thumbnailBase64 } = achievement

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(achievement)}
      className="group w-full rounded-2xl border border-border/40 bg-card overflow-hidden text-left cursor-pointer transition-shadow duration-200 hover:shadow-lg hover:shadow-black/20 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Ver detalhes: ${eventName}`}
    >
      {thumbnailBase64 ? (
        <div className="relative h-40 overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailBase64} alt={eventName} className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
            {distance && (
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
                {distance}
              </span>
            )}
            {category && (
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                {category}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 transition-colors duration-200 group-hover:from-primary/15 group-hover:to-primary/10">
          <span className="text-4xl">🏆</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-200">
              {eventName}
            </h3>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              {eventDate && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 shrink-0" />{eventDate}
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />{location}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 mt-0.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary/60" />
        </div>

        {netTime && (
          <div className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2">
            <Timer className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs text-primary/70 uppercase tracking-wide">Tempo líquido</span>
            <span className="ml-auto text-sm font-bold font-mono text-primary">{netTime}</span>
          </div>
        )}
      </div>
    </motion.button>
  )
}
