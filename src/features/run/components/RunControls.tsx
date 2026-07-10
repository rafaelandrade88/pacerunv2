'use client'
import { motion } from 'framer-motion'
import { Flag, Pause, Play, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useRunStore } from '@/features/run/store/runStore'
import { cn } from '@/lib/utils'

function CountdownOverlay({ count }: { count: number }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm" role="status" aria-live="assertive">
      <motion.span
        key={count}
        initial={{ scale: 2.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-[9rem] font-bold leading-none text-primary tabular-nums"
      >
        {count}
      </motion.span>
    </div>
  )
}

export function RunControls() {
  const { status, gpsReady, startRun, pauseRun, resumeRun, finishRun } = useRunStore()
  const router = useRouter()
  const [countdown, setCountdown] = useState<number | null>(null)

  // Contagem 3-2-1 antes de iniciar: dá tempo de guardar o celular / se posicionar
  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      setCountdown(null)
      startRun()
      return
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, startRun])

  function handleFinish() { finishRun(); router.push('/run/summary') }

  return (
    <div className="flex items-center justify-center gap-6">
      {countdown !== null && countdown > 0 && <CountdownOverlay count={countdown} />}
      {(status === 'idle' || status === 'ready') && (
        <motion.div whileTap={{ scale: 0.94 }}>
          <Button onClick={() => setCountdown(3)} disabled={!gpsReady || countdown !== null} size="lg" className={cn('h-20 w-20 rounded-full text-lg font-bold bg-primary text-primary-foreground shadow-xl shadow-primary/30 disabled:opacity-40')}>
            <Play className="h-8 w-8 fill-current" />
          </Button>
        </motion.div>
      )}
      {status === 'running' && (
        <>
          <motion.div whileTap={{ scale: 0.94 }}><Button onClick={() => pauseRun()} variant="outline" size="lg" className="h-16 w-16 rounded-full"><Pause className="h-6 w-6" /></Button></motion.div>
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
