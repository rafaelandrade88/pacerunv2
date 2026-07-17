'use client'
import 'leaflet/dist/leaflet.css'

import { useEffect, useRef } from 'react'

import type { GeoPoint } from '@/domain/entities/Activity'

interface LiveMapProps { route: GeoPoint[]; className?: string }

// Após o corredor arrastar/zoomar o mapa, o auto-seguir fica suspenso por
// este intervalo antes de voltar a centralizar no ponto atual.
const FOLLOW_RESUME_MS = 15_000

interface LeafletMapLike {
  setView(c: [number, number], z: number): void
  panTo(c: [number, number]): void
  getZoom(): number | undefined
  remove(): void
  invalidateSize(): void
}
interface PolylineLike {
  setLatLngs(l: [number, number][]): void
  addLatLng(l: [number, number]): void
  getLatLngs(): unknown[]
}

export function LiveMap({ route, className }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMapLike | null>(null)
  const polylineRef = useRef<PolylineLike | null>(null)
  const userMarkerRef = useRef<unknown>(null)
  const initializedRef = useRef(false)
  // Quantos pontos da rota já estão desenhados (para adicionar só os novos)
  const renderedCountRef = useRef(0)
  // Última interação manual do usuário com o mapa (pan/zoom)
  const lastInteractionRef = useRef(0)
  // Rota mais recente, para o init assíncrono desenhar o estado atual
  const routeRef = useRef(route)
  routeRef.current = route

  useEffect(() => {
    if (!mapRef.current || initializedRef.current) return
    initializedRef.current = true
    let disposed = false
    let observer: ResizeObserver | null = null
    const container = mapRef.current
    const markInteraction = () => { lastInteractionRef.current = Date.now() }
    import('leaflet').then((L) => {
      if (disposed || !mapRef.current) return
      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
      const polyline = L.polyline([], { color: '#00D563', weight: 4, opacity: 0.9, lineJoin: 'round', lineCap: 'round' }).addTo(map)
      const pulseIcon = L.divIcon({ className: '', html: '<div style="width:16px;height:16px;background:#00D563;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(0,213,99,0.3)"></div>', iconSize: [16, 16], iconAnchor: [8, 8] })
      const userMarker = L.marker([0, 0], { icon: pulseIcon })
      navigator.geolocation?.getCurrentPosition(
        (pos) => { const center: [number, number] = [pos.coords.latitude, pos.coords.longitude]; map.setView(center, 16); userMarker.setLatLng(center).addTo(map) },
        () => { map.setView([-15.7801, -47.9292], 4) },
        { enableHighAccuracy: true, timeout: 5000 }
      )
      mapInstanceRef.current = map as unknown as LeafletMapLike
      polylineRef.current = polyline as unknown as PolylineLike
      userMarkerRef.current = userMarker
      // Corrida em andamento reaberta: desenha o que já existe da rota
      const existing = routeRef.current
      if (existing.length > 0) {
        polyline.setLatLngs(existing.map((p) => [p.lat, p.lng]))
        const last = existing[existing.length - 1]
        userMarker.setLatLng([last.lat, last.lng]).addTo(map)
        map.setView([last.lat, last.lng], 16)
      }
      renderedCountRef.current = existing.length
      // Eventos DOM (não os do Leaflet) para detectar interação DO USUÁRIO —
      // os eventos do Leaflet também disparam em pan/zoom programático.
      container.addEventListener('pointerdown', markInteraction)
      container.addEventListener('wheel', markInteraction, { passive: true })
      // O container é montado via dynamic import (skeleton antes), então o Leaflet
      // pode medir o tamanho errado na inicialização — recalcula após o layout.
      // Os guards com `disposed` evitam invalidateSize após o map.remove()
      // (callbacks de rAF/ResizeObserver podem disparar durante a navegação).
      requestAnimationFrame(() => { if (!disposed) map.invalidateSize() })
      observer = new ResizeObserver(() => { if (!disposed) map.invalidateSize() })
      observer.observe(mapRef.current)
    })
    return () => {
      disposed = true
      observer?.disconnect()
      container.removeEventListener('pointerdown', markInteraction)
      container.removeEventListener('wheel', markInteraction)
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; polylineRef.current = null; userMarkerRef.current = null; initializedRef.current = false; renderedCountRef.current = 0 }
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    const polyline = polylineRef.current
    if (!map || !polyline || route.length === 0) return

    // Desenho incremental: só os pontos novos (setLatLngs da rota inteira a
    // cada ponto GPS é O(n²) acumulado ao longo de uma corrida longa).
    if (route.length < renderedCountRef.current) {
      // Rota resetada (nova corrida): redesenha do zero
      polyline.setLatLngs(route.map((p) => [p.lat, p.lng] as [number, number]))
    } else {
      for (let i = renderedCountRef.current; i < route.length; i++) {
        polyline.addLatLng([route[i].lat, route[i].lng])
      }
    }
    renderedCountRef.current = route.length

    const last = route[route.length - 1]
    const lastLatLng: [number, number] = [last.lat, last.lng]
    if (userMarkerRef.current) (userMarkerRef.current as { setLatLng(l: [number, number]): void }).setLatLng(lastLatLng)

    // Mapa ainda sem view inicial (getCurrentPosition não respondeu):
    // panTo sem zoom definido crasha o Leaflet ("infinite number of tiles").
    const zoom = map.getZoom()
    if (zoom === undefined || Number.isNaN(zoom)) {
      map.setView(lastLatLng, 16)
      return
    }
    // Auto-seguir: respeita o corredor explorando o mapa — pan/zoom manual
    // suspende o recentro por FOLLOW_RESUME_MS. panTo preserva o zoom escolhido.
    if (Date.now() - lastInteractionRef.current > FOLLOW_RESUME_MS) {
      map.panTo(lastLatLng)
    }
  }, [route])

  return <div ref={mapRef} role="region" aria-label="Mapa da corrida em tempo real" className={className ?? 'h-[40vh] min-h-[280px] w-full rounded-2xl overflow-hidden'} />
}
