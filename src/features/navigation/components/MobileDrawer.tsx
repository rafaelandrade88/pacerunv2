'use client'
import { Activity, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { NavItem } from '@/features/navigation/components/NavItem'
import { NAV_ITEMS } from '@/features/navigation/constants/navItems'
import { cn } from '@/lib/utils'

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

// Sempre montado, animado via CSS (sem AnimatePresence): desmontar com exit
// animation durante uma troca de rota deixava o overlay invisível preso no DOM
// bloqueando todos os cliques da tela.
export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // close on navigation
  useEffect(() => { onClose() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          'fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col border-r border-border/40 bg-card p-6 transition-transform duration-300 ease-out lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        )}
        aria-label="Menu de navegação"
        aria-hidden={!open}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2" tabIndex={open ? 0 : -1}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">PaceRun</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg" aria-label="Fechar menu" tabIndex={open ? 0 : -1}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.href} item={item} variant="sidebar" />
          ))}
        </nav>
        <div className="border-t border-border/40 pt-4">
          <p className="text-center text-[10px] text-muted-foreground">PaceRun v2.0.0</p>
        </div>
      </aside>
    </>
  )
}
