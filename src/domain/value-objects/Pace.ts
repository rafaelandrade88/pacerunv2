export class Pace {
  private readonly secondsPerKm: number
  private constructor(secondsPerKm: number) {
    if (secondsPerKm < 0) throw new Error('Pace não pode ser negativo')
    this.secondsPerKm = secondsPerKm
  }
  static fromSecondsPerKm(seconds: number): Pace { return new Pace(seconds) }
  static calculate(distanceMeters: number, durationSeconds: number): Pace {
    if (distanceMeters === 0) return new Pace(0)
    const km = distanceMeters / 1000
    return new Pace(durationSeconds / km)
  }
  toSecondsPerKm(): number { return this.secondsPerKm }
  format(): string {
    if (this.secondsPerKm === 0) return '--:--/km'
    const m = Math.floor(this.secondsPerKm / 60)
    const s = Math.floor(this.secondsPerKm % 60)
    return `${m}:${String(s).padStart(2, '0')}/km`
  }
}
