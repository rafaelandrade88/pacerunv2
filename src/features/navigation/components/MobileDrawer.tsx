'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { NavItem } from '@/features/navigation/components/NavItem'
import { NAV_ITEMS } from '@/features/navigation/constants/navItems'

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // close on navigation
  useEffect(() => { onClose() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col border-r border-border/40 bg-card p-6 lg:hidden"
            aria-label="Menu de navegação"
          >
            <div className="mb-8 flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold tracking-tight">PaceRun</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg" aria-label="Fechar menu">
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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
