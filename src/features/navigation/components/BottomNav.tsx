'use client'
import { motion } from 'framer-motion'

import { NavItem } from '@/features/navigation/components/NavItem'
import { NAV_ITEMS } from '@/features/navigation/constants/navItems'

export function BottomNav() {
  return (
    <motion.nav initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-card/95 backdrop-blur-md border-t border-border/40 pb-safe px-2 pt-2 lg:hidden"
      aria-label="Navegação principal">
      {NAV_ITEMS.filter((item) => !item.hideFromBottomNav).map((item) => <NavItem key={item.href} item={item} variant="bottom" />)}
    </motion.nav>
  )
}
