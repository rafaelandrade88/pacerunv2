'use client'
import { useEffect, useRef, useState } from 'react'

export type WakeLockStatus = 'inactive' | 'engaged' | 'unavailable' | 'denied'

/**
 * Mantém a tela do dispositivo ligada enquanto `active` for true (Screen Wake Lock API).
 * Navegadores móveis suspendem o JavaScript e o GPS quando a tela apaga — para um
 * app de corrida web, manter a tela acesa é a única forma de garantir o tracking.
 *
 * Retorna o status para a UI poder avisar quando o lock falhar:
 * - 'engaged'     — tela protegida contra bloqueio
 * - 'denied'      — o sistema negou (ex: Modo de Baixa Energia no iOS)
 * - 'unavailable' — navegador sem suporte à API
 * - 'inactive'    — não solicitado (corrida não ativa)
 *
 * O sistema pode soltar o lock a qualquer momento (troca de app, aviso do SO);
 * re-adquirimos no evento 'release' e ao voltar a ficar visível.
 */
export function useWakeLock(active: boolean): WakeLockStatus {
  const sentinelRef = useRef<WakeLockSentinel | null>(null)
  const [status, setStatus] = useState<WakeLockStatus>('inactive')

  useEffect(() => {
    if (!active) { setStatus('inactive'); return }
    if (!('wakeLock' in navigator)) { setStatus('unavailable'); return }

    let cancelled = false

    async function acquire() {
      if (cancelled || document.visibilityState !== 'visible') return
      try {
        const sentinel = await navigator.wakeLock.request('screen')
        if (cancelled) { await sentinel.release(); return }
        sentinelRef.current = sentinel
        setStatus('engaged')
        sentinel.addEventListener('release', () => {
          sentinelRef.current = null
          if (cancelled) return
          setStatus('inactive')
          // O SO soltou o lock (ex: notificação, troca rápida de app):
          // tenta readquirir imediatamente se a página continua visível
          if (document.visibilityState === 'visible') acquire()
        })
      } catch {
        // iOS nega com Modo de Baixa Energia ativado, entre outros
        if (!cancelled) setStatus('denied')
      }
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
      setStatus('inactive')
    }
  }, [active])

  return status
}
