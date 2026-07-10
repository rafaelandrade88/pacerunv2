'use client'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import Link from 'next/link'

import { APP_CONFIG } from '@/constants/app'
import { NavItem } from '@/features/navigation/components/NavItem'
import { NAV_ITEMS } from '@/features/navigation/constants/navItems'

export function Sidebar() {
  return (
    <motion.aside initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 w-64 border-r border-border/40 bg-card/50 backdrop-blur-sm p-6"
      aria-label="Menu lateral">
      <Link href="/dashboard" className="flex items-center gap-2 mb-10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Activity className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight">PaceRun</span>
      </Link>
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => <NavItem key={item.href} item={item} variant="sidebar" />)}
      </nav>
      <div className="border-t border-border/40 pt-4">
        <p className="text-[10px] text-muted-foreground text-center">PaceRun v{APP_CONFIG.version}</p>
      </div>
    </motion.aside>
  )
}
