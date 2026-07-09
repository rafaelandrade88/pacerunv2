'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { NavItem as NavItemType } from '@/features/navigation/constants/navItems'
import { cn } from '@/lib/utils'

interface NavItemProps { item: NavItemType; variant: 'bottom' | 'sidebar' }

export function NavItem({ item, variant }: NavItemProps) {
  const pathname = usePathname()
  const isActive = item.exactMatch ? pathname === item.href : pathname.startsWith(item.href)
  const Icon = item.icon
  const isRunButton = item.href === '/run'

  if (variant === 'bottom') {
    if (isRunButton) {
      return (
        <Link href={item.href} className="flex flex-col items-center gap-1" aria-label={item.label}>
          <motion.div whileTap={{ scale: 0.93 }} className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/40">
            <Icon className="h-5 w-5" />
          </motion.div>
          <span className="text-[10px] font-medium text-primary">{item.label}</span>
        </Link>
      )
    }
    return (
      <Link href={item.href} className="flex flex-col items-center gap-1 px-3 py-2 min-w-[60px]" aria-label={item.label} aria-current={isActive ? 'page' : undefined}>
        <motion.div whileTap={{ scale: 0.9 }} className="relative">
          <Icon className={cn('h-5 w-5 transition-colors duration-200', isActive ? 'text-primary' : 'text-muted-foreground')} />
          {isActive && <motion.div layoutId="bottom-nav-indicator" className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />}
        </motion.div>
        <span className={cn('text-[10px] font-medium transition-colors duration-200', isActive ? 'text-primary' : 'text-muted-foreground')}>{item.label}</span>
      </Link>
    )
  }

  return (
    <Link href={item.href} aria-current={isActive ? 'page' : undefined} className={cn('group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200', isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground', isRunButton && !isActive && 'text-primary hover:bg-primary/10')}>
      {isActive && <motion.div layoutId="sidebar-indicator" className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />}
      <Icon className={cn('h-5 w-5 shrink-0 transition-colors duration-200', isRunButton && !isActive && 'text-primary')} />
      <span>{item.label}</span>
      {isRunButton && <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">+</span>}
    </Link>
  )
}
