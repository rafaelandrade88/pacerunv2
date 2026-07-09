export class Duration {
  private readonly seconds: number
  private constructor(seconds: number) {
    if (seconds < 0) throw new Error('Duração não pode ser negativa')
    this.seconds = seconds
  }
  static fromSeconds(seconds: number): Duration { return new Duration(seconds) }
  static fromMilliseconds(ms: number): Duration { return new Duration(Math.floor(ms / 1000)) }
  toSeconds(): number { return this.seconds }
  format(): string {
    const h = Math.floor(this.seconds / 3600)
    const m = Math.floor((this.seconds % 3600) / 60)
    const s = this.seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
}
