'use client'
import { useEffect, useRef } from 'react'

/**
 * Mantém a tela do dispositivo ligada enquanto `active` for true (Screen Wake Lock API).
 * Navegadores móveis suspendem o JavaScript e o GPS quando a tela apaga — para um
 * app de corrida web, manter a tela acesa é a única forma de garantir o tracking.
 * O lock é liberado pelo sistema ao trocar de aba/app e readquirido ao voltar.
 */
export function useWakeLock(active: boolean) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return

    let cancelled = false

    async function acquire() {
      try {
        const sentinel = await navigator.wakeLock.request('screen')
        if (cancelled) { await sentinel.release(); return }
        sentinelRef.current = sentinel
      } catch { /* bateria baixa ou permissão negada — segue sem wake lock */ }
    }

    function onVisible() {
      if (document.visibilityState === 'visible') acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      sentinelRef.current?.release().catch(() => {})
      sentinelRef.current = null
    }
  }, [active])
}
