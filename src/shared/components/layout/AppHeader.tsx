'use client'
import { motion } from 'framer-motion'
import { Menu, Moon, Sparkles, Sun } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuthActions } from '@/features/auth/hooks/useAuthActions'
import { MobileDrawer } from '@/features/navigation/components/MobileDrawer'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { ReleaseNotesModal } from '@/features/release-notes/components/ReleaseNotesModal'
import { useReleaseNotes } from '@/features/release-notes/hooks/useReleaseNotes'
import { useAuth } from '@/providers/AuthProvider'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-11 w-11" />
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Alternar tema" className="h-11 w-11 rounded-xl">
      <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </motion.div>
    </Button>
  )
}

// Título da página atual no header desktop (a marca já está na sidebar).
// Prefixos mais específicos primeiro para sub-rotas resolverem corretamente.
const PAGE_TITLES: [prefix: string, title: string][] = [
  ['/profile/edit', 'Editar perfil'],
  ['/profile', 'Perfil'],
  ['/run/summary', 'Resumo da corrida'],
  ['/run', 'Correr'],
  ['/history', 'Histórico'],
  ['/conquistas', 'Conquistas'],
  ['/dashboard', 'Dashboard'],
]

export function AppHeader() {
  const { user } = useAuth()
  const pathname = usePathname()
  const pageTitle = PAGE_TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? ''
  const { data: profile } = useProfile()
  const { signOut, loading } = useAuthActions()
  const { hasUnread, isOpen: notesOpen, open: openNotes, close: closeNotes } = useReleaseNotes()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const photoURL = profile?.photoURL ?? user?.photoURL ?? undefined
  const initials = user?.displayName?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() ?? 'U'

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur-sm px-4 lg:px-6">
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDrawerOpen(true)}
            className="h-11 w-11 rounded-xl"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <span className="hidden lg:block text-sm font-semibold text-muted-foreground">{pageTitle}</span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={openNotes}
            className="relative h-11 w-11 rounded-xl"
            aria-label="Novidades"
          >
            <Sparkles className="h-4 w-4" />
            {hasUnread && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" aria-hidden />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="relative h-11 w-11 rounded-xl p-0" aria-label="Menu do usuário">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={photoURL} alt={user?.displayName ?? 'Usuário'} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium truncate">{user?.displayName ?? 'Usuário'}</span>
                    <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} disabled={loading} className="text-destructive focus:text-destructive cursor-pointer">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <ReleaseNotesModal open={notesOpen} onClose={closeNotes} />
    </>
  )
}
