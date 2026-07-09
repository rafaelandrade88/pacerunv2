import type { GeoPoint } from '@/domain/entities/Activity'

export interface ShareImageData {
  title: string
  dateLabel: string
  distance: string
  duration: string
  pace: string
  route?: GeoPoint[]
}

const SIZE = 1080
const GREEN = '#00D563'
const BG = '#0A0A0A'
const CARD = '#161616'
const MUTED = '#9ca3af'

function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Quadrado arredondado verde com o "pulso" do PaceRun (mesma identidade do app)
  const s = 72
  ctx.save()
  ctx.fillStyle = GREEN
  ctx.beginPath()
  ctx.roundRect(x, y, s, s, 18)
  ctx.fill()
  ctx.strokeStyle = BG
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(x + 12, y + s / 2)
  ctx.lineTo(x + 24, y + s / 2)
  ctx.lineTo(x + 32, y + 20)
  ctx.lineTo(x + 42, y + s - 20)
  ctx.lineTo(x + 50, y + s / 2)
  ctx.lineTo(x + 60, y + s / 2)
  ctx.stroke()
  ctx.restore()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 52px system-ui, -apple-system, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText('PaceRun', x + s + 24, y + s / 2 + 2)
}

function drawRoute(ctx: CanvasRenderingContext2D, route: GeoPoint[], x: number, y: number, w: number, h: number) {
  if (route.length < 2) return
  const lats = route.map((p) => p.lat)
  const lngs = route.map((p) => p.lng)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const spanLat = Math.max(maxLat - minLat, 1e-6)
  const spanLng = Math.max(maxLng - minLng, 1e-6)
  // Mantém proporção da rota dentro da área disponível
  const scale = Math.min(w / spanLng, h / spanLat) * 0.9
  const offX = x + (w - spanLng * scale) / 2
  const offY = y + (h - spanLat * scale) / 2

  ctx.save()
  ctx.strokeStyle = GREEN
  ctx.lineWidth = 8
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = 'rgba(0, 213, 99, 0.4)'
  ctx.shadowBlur = 24
  ctx.beginPath()
  route.forEach((p, i) => {
    const px = offX + (p.lng - minLng) * scale
    const py = offY + (maxLat - p.lat) * scale
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  })
  ctx.stroke()
  ctx.restore()

  // Marcadores de início (verde) e fim (branco)
  const first = route[0]
  const last = route[route.length - 1]
  for (const [p, color] of [[first, GREEN], [last, '#ffffff']] as const) {
    const px = offX + (p.lng - minLng) * scale
    const py = offY + (maxLat - p.lat) * scale
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(px, py, 12, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = BG
    ctx.lineWidth = 4
    ctx.stroke()
  }
}

export function generateShareImage(data: ShareImageData): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  // Fundo
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, SIZE, SIZE)
  // Brilho radial verde sutil no topo
  const glow = ctx.createRadialGradient(SIZE / 2, 0, 0, SIZE / 2, 0, SIZE)
  glow.addColorStop(0, 'rgba(0, 213, 99, 0.12)')
  glow.addColorStop(1, 'rgba(0, 213, 99, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, SIZE, SIZE)

  drawLogo(ctx, 72, 64)

  // Título e data
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 44px system-ui, -apple-system, sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(data.title.slice(0, 32), 72, 240)
  ctx.fillStyle = MUTED
  ctx.font = '30px system-ui, -apple-system, sans-serif'
  ctx.fillText(data.dateLabel, 72, 290)

  // Rota (se houver)
  if (data.route && data.route.length > 1) {
    drawRoute(ctx, data.route, 120, 330, SIZE - 240, 380)
  }

  // Cards de métricas na base
  const metrics = [
    { label: 'DISTÂNCIA', value: data.distance },
    { label: 'DURAÇÃO', value: data.duration },
    { label: 'RITMO MÉDIO', value: data.pace },
  ]
  const cardW = (SIZE - 72 * 2 - 24 * 2) / 3
  const cardY = 780
  const cardH = 200
  metrics.forEach((m, i) => {
    const cx = 72 + i * (cardW + 24)
    ctx.fillStyle = CARD
    ctx.beginPath()
    ctx.roundRect(cx, cardY, cardW, cardH, 24)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = i === 0 ? GREEN : '#ffffff'
    ctx.font = 'bold 56px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(m.value, cx + cardW / 2, cardY + 100)
    ctx.fillStyle = MUTED
    ctx.font = '600 22px system-ui, -apple-system, sans-serif'
    ctx.fillText(m.label, cx + cardW / 2, cardY + 152)
    ctx.textAlign = 'left'
  })

  ctx.fillStyle = MUTED
  ctx.font = '26px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('pacerun — rastreie suas corridas', SIZE / 2, SIZE - 40)
  ctx.textAlign = 'left'

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar imagem'))), 'image/png')
  })
}

/**
 * Compartilha via Web Share API (abre o menu nativo com Instagram, WhatsApp,
 * Facebook etc). Se o navegador não suportar compartilhar arquivos, baixa o PNG.
 * Retorna 'shared' | 'downloaded' | 'cancelled'.
 */
export async function shareRunImage(data: ShareImageData): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const blob = await generateShareImage(data)
  const file = new File([blob], 'pacerun-corrida.png', { type: 'image/png' })

  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: data.title })
      return 'shared'
    } catch (err) {
      if ((err as Error).name === 'AbortError') return 'cancelled'
      // NotAllowedError etc — cai para download
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'pacerun-corrida.png'
  a.click()
  URL.revokeObjectURL(url)
  return 'downloaded'
}
