import type { GeoPoint } from '@/domain/entities/Activity'
import { isValidPoint, toGeoPoint } from '@/features/run/utils/geoUtils'

export type GpsCallback = (point: GeoPoint) => void
export type GpsErrorCallback = (error: GeolocationPositionError) => void
export interface GpsServiceOptions { onPoint: GpsCallback; onError: GpsErrorCallback }

export class GpsService {
  private watchId: number | null = null
  private lastPoint: GeoPoint | null = null

  start(options: GpsServiceOptions): void {
    if (!navigator.geolocation) {
      options.onError({ code: 2, message: 'Geolocalização não suportada', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError)
      return
    }
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!isValidPoint(position, this.lastPoint)) return
        const point = toGeoPoint(position)
        this.lastPoint = point
        options.onPoint(point)
      },
      options.onError,
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10_000 }
    )
  }

  stop(): void {
    if (this.watchId !== null) { navigator.geolocation.clearWatch(this.watchId); this.watchId = null }
    this.lastPoint = null
  }

  isRunning(): boolean { return this.watchId !== null }
}
