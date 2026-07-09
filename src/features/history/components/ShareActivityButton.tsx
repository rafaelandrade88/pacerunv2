'use client'
import { Check, Loader2, Share2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import type { Activity } from '@/domain/entities/Activity'
import { Distance } from '@/domain/value-objects/Distance'
import { Duration } from '@/domain/value-objects/Duration'
import { Pace } from '@/domain/value-objects/Pace'
import { shareRunImage } from '@/features/history/utils/shareImage'
import { formatDate } from '@/lib/utils'

interface ShareActivityButtonProps { activity: Activity }

export function ShareActivityButton({ activity }: ShareActivityButtonProps) {
  const [sharing, setSharing] = useState(false)
  const [done, setDone] = useState(false)

  async function handleShare() {
    if (sharing) return
    setSharing(true)
    try {
      const result = await shareRunImage({
        title: activity.title,
        dateLabel: formatDate(activity.startedAt),
        distance: Distance.fromMeters(activity.distance).format(),
        duration: Duration.fromSeconds(activity.duration).format(),
        pace: Pace.calculate(activity.distance, activity.duration).format(),
        route: activity.route,
      })
      if (result !== 'cancelled') {
        setDone(true)
        setTimeout(() => setDone(false), 2000)
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err)
    } finally {
      setSharing(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleShare}
      disabled={sharing}
      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary shrink-0"
      aria-label="Compartilhar atividade"
    >
      {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : done ? <Check className="h-4 w-4 text-primary" /> : <Share2 className="h-4 w-4" />}
    </Button>
  )
}
