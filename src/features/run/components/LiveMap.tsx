'use client'
import 'leaflet/dist/leaflet.css'

import { useEffect, useRef } from 'react'

import type { GeoPoint } from '@/domain/entities/Activity'

interface LiveMapProps { route: GeoPoint[]; className?: string }

export function LiveMap({ route, className }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const polylineRef = useRef<unknown>(null)
  const userMarkerRef = useRef<unknown>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!mapRef.current || initializedRef.current) return
    initializedRef.current = true
    let disposed = false
    let observer: ResizeObserver | null = null
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
      mapInstanceRef.current = map; polylineRef.current = polyline; userMarkerRef.current = userMarker
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
      if (mapInstanceRef.current) { (mapInstanceRef.current as { remove(): void }).remove(); mapInstanceRef.current = null; polylineRef.current = null; userMarkerRef.current = null; initializedRef.current = false }
    }
  }, [])

  useEffect(() => {
    if (!polylineRef.current || !mapInstanceRef.current || route.length === 0) return
    import('leaflet').then(() => {
      // Pode resolver após o unmount — re-checa as refs
      if (!polylineRef.current || !mapInstanceRef.current) return
      const latLngs = route.map((p) => [p.lat, p.lng] as [number, number])
      ;(polylineRef.current as { setLatLngs(l: [number, number][]): void }).setLatLngs(latLngs)
      const lastPoint = latLngs[latLngs.length - 1]
      if (userMarkerRef.current) (userMarkerRef.current as { setLatLng(l: [number, number]): void }).setLatLng(lastPoint)
      ;(mapInstanceRef.current as { setView(c: [number, number], z: number): void }).setView(lastPoint, 16)
    })
  }, [route])

  return <div ref={mapRef} className={className ?? 'h-[40vh] min-h-[280px] w-full rounded-2xl overflow-hidden'} />
}
