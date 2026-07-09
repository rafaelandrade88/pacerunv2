import { ACTIVITY_LIMITS } from '@/constants/app'
import type { GeoPoint } from '@/domain/entities/Activity'

const EARTH_RADIUS_METERS = 6_371_000

export function haversineDistance(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const h = sinDLat * sinDLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h))
}

export function isValidPoint(point: GeolocationPosition, lastPoint: GeoPoint | null): boolean {
  if (point.coords.accuracy > ACTIVITY_LIMITS.MIN_ACCURACY_METERS) return false
  if (!lastPoint) return true
  const candidate: GeoPoint = { lat: point.coords.latitude, lng: point.coords.longitude, timestamp: point.timestamp }
  return haversineDistance(lastPoint, candidate) >= 5
}

export function toGeoPoint(position: GeolocationPosition): GeoPoint {
  const point: GeoPoint = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp,
  }
  if (position.coords.altitude !== null && position.coords.altitude !== undefined) {
    point.altitude = position.coords.altitude
  }
  return point
}

export function calculateInstantPace(prev: GeoPoint, curr: GeoPoint): number {
  const distanceMeters = haversineDistance(prev, curr)
  const timeDeltaSeconds = (curr.timestamp - prev.timestamp) / 1000
  if (distanceMeters < 5 || timeDeltaSeconds <= 0) return 0
  const metersPerSecond = distanceMeters / timeDeltaSeconds
  if (metersPerSecond <= 0) return 0
  return 1000 / metersPerSecond
}

export function smoothPace(paceHistory: number[], windowSize = 5): number {
  const valid = paceHistory.filter((p) => p > 0)
  if (valid.length === 0) return 0
  const window = valid.slice(-windowSize)
  return window.reduce((sum, p) => sum + p, 0) / window.length
}

export function generateActivityTitle(type: string): string {
  const hour = new Date().getHours()
  const period = hour < 12 ? 'Manhã' : hour < 18 ? 'Tarde' : 'Noite'
  const typeLabel: Record<string, string> = { run: 'Corrida', walk: 'Caminhada', trail: 'Trail', treadmill: 'Esteira' }
  return `${typeLabel[type] ?? 'Atividade'} de ${period}`
}
