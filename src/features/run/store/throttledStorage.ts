import type { StateStorage } from 'zustand/middleware'

/**
 * sessionStorage com throttle de escrita para o estado da corrida.
 *
 * O persist do zustand serializa o estado inteiro (rota com milhares de
 * pontos GPS ≈ centenas de KB no fim de um longão) a cada mudança — e o
 * cronômetro muda a cada segundo. Isso custa CPU/bateria num app de corrida.
 *
 * Estratégia: no máximo uma escrita a cada WRITE_INTERVAL_MS (última versão
 * pendente sempre vence), com flush imediato quando a página fica oculta ou
 * descarrega — que é exatamente o momento em que persistir importa (o SO pode
 * matar a aba em background). Janela máxima de perda em crash: ~5s de pontos.
 */
const WRITE_INTERVAL_MS = 5_000

export function createThrottledSessionStorage(): StateStorage {
  let pending: { name: string; value: string } | null = null
  let lastWriteAt = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  function flush() {
    if (timer) { clearTimeout(timer); timer = null }
    if (!pending) return
    try { sessionStorage.setItem(pending.name, pending.value) } catch { /* quota/privado */ }
    pending = null
    lastWriteAt = Date.now()
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })
    window.addEventListener('pagehide', flush)
  }

  return {
    getItem: (name) => sessionStorage.getItem(name),
    setItem: (name, value) => {
      pending = { name, value }
      const elapsed = Date.now() - lastWriteAt
      if (elapsed >= WRITE_INTERVAL_MS) flush()
      else if (!timer) timer = setTimeout(flush, WRITE_INTERVAL_MS - elapsed)
    },
    removeItem: (name) => {
      pending = null
      if (timer) { clearTimeout(timer); timer = null }
      sessionStorage.removeItem(name)
    },
  }
}
