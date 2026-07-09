'use client'
import 'leaflet/dist/leaflet.css'

import { useEffect, useRef } from 'react'

import type { GeoPoint } from '@/domain/entities/Activity'

interface RouteMapInnerProps { route: GeoPoint[]; className?: string }

export function RouteMapInner({ route, className }: RouteMapInnerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    let disposed = false
    import('leaflet').then((L) => {
      if (disposed || !mapRef.current) return
      const latLngs = route.map((p) => [p.lat, p.lng] as [number, number])
      const map = L.map(mapRef.current!, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
      const polyline = L.polyline(latLngs, { color: '#00D563', weight: 4, opacity: 0.9 }).addTo(map)
      const startIcon = L.divIcon({ className: '', html: '<div style="width:10px;height:10px;background:#00D563;border:2px solid white;border-radius:50%"></div>', iconSize: [10, 10], iconAnchor: [5, 5] })
      const endIcon = L.divIcon({ className: '', html: '<div style="width:12px;height:12px;background:#ef4444;border:2px solid white;border-radius:50%"></div>', iconSize: [12, 12], iconAnchor: [6, 6] })
      L.marker(latLngs[0], { icon: startIcon }).addTo(map)
      L.marker(latLngs[latLngs.length - 1], { icon: endIcon }).addTo(map)
      map.fitBounds(polyline.getBounds(), { padding: [24, 24] })
      mapInstance.current = map
      requestAnimationFrame(() => { if (!disposed) { map.invalidateSize(); map.fitBounds(polyline.getBounds(), { padding: [24, 24] }) } })
    })
    return () => { disposed = true; if (mapInstance.current) { (mapInstance.current as { remove(): void }).remove(); mapInstance.current = null } }
  }, [route])

  return <div ref={mapRef} className={className ?? 'h-64 w-full rounded-2xl overflow-hidden'} />
}
