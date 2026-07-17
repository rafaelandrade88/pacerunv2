import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  /** Ação alinhada à direita do título (ex: botão Editar). */
  action?: React.ReactNode
  className?: string
}

/**
 * Cabeçalho padrão de página: garante exatamente um <h1> por página
 * (landmark principal para leitores de tela) com espaçamento consistente.
 */
export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex items-center justify-between gap-3', className)}>
      <div className="space-y-1 min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
