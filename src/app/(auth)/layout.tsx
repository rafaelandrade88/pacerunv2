import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-pace-dark-100 p-12 border-r border-border/40">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-primary font-bold text-2xl tracking-tight">PaceRun</span>
        </Link>
        <div className="space-y-4">
          <blockquote className="text-3xl font-semibold leading-tight">&ldquo;Cada quilômetro é uma vitória sobre quem você era ontem.&rdquo;</blockquote>
          <p className="text-muted-foreground text-sm">Rastreie suas corridas. Supere seus limites.</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[{ value: '—', label: 'Corredores' }, { value: '—', label: 'km registrados' }, { value: '—', label: 'Atividades' }].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden text-center">
            <Link href="/"><span className="text-primary font-bold text-3xl tracking-tight">PaceRun</span></Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
