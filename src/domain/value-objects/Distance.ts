export class Distance {
  private readonly meters: number
  private constructor(meters: number) {
    if (meters < 0) throw new Error('Distância não pode ser negativa')
    this.meters = meters
  }
  static fromMeters(meters: number): Distance { return new Distance(meters) }
  static fromKilometers(km: number): Distance { return new Distance(km * 1000) }
  toMeters(): number { return this.meters }
  toKilometers(): number { return this.meters / 1000 }
  format(): string {
    if (this.meters < 1000) return `${this.meters.toFixed(0)}m`
    return `${this.toKilometers().toFixed(2)}km`
  }
}
