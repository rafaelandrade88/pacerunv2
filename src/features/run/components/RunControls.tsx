'use client'
import { motion } from 'framer-motion'
import { Flag, Pause, Play, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useRunStore } from '@/features/run/store/runStore'
import { cn } from '@/lib/utils'

export function RunControls() {
  const { status, gpsReady, startRun, pauseRun, resumeRun, finishRun } = useRunStore()
  const router = useRouter()

  function handleFinish() { finishRun(); router.push('/run/summary') }

  return (
    <div className="flex items-center justify-center gap-6">
      {(status === 'idle' || status === 'ready') && (
        <motion.div whileTap={{ scale: 0.94 }}>
          <Button onClick={startRun} disabled={!gpsReady} size="lg" className={cn('h-20 w-20 rounded-full text-lg font-bold bg-primary text-primary-foreground shadow-xl shadow-primary/30 disabled:opacity-40')}>
            <Play className="h-8 w-8 fill-current" />
          </Button>
        </motion.div>
      )}
      {status === 'running' && (
        <>
          <motion.div whileTap={{ scale: 0.94 }}><Button onClick={pauseRun} variant="outline" size="lg" className="h-16 w-16 rounded-full"><Pause className="h-6 w-6" /></Button></motion.div>
          <motion.div whileTap={{ scale: 0.94 }}><Button onClick={handleFinish} size="lg" className="h-20 w-20 rounded-full bg-destructive text-destructive-foreground shadow-xl"><Flag className="h-7 w-7" /></Button></motion.div>
        </>
      )}
      {status === 'paused' && (
        <>
          <motion.div whileTap={{ scale: 0.94 }}><Button onClick={handleFinish} variant="outline" size="lg" className="h-16 w-16 rounded-full"><Square className="h-5 w-5" /></Button></motion.div>
          <motion.div whileTap={{ scale: 0.94 }}><Button onClick={resumeRun} size="lg" className="h-20 w-20 rounded-full bg-primary text-primary-foreground shadow-xl"><Play className="h-8 w-8 fill-current" /></Button></motion.div>
        </>
      )}
    </div>
  )
}
