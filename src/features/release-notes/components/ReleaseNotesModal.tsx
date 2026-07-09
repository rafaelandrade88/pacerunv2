'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { RELEASE_NOTES } from '@/data/releaseNotes'

interface ReleaseNotesModalProps {
  open: boolean
  onClose: () => void
}

export function ReleaseNotesModal({ open, onClose }: ReleaseNotesModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal aria-label="Novidades">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-md max-h-[82vh] overflow-y-auto rounded-2xl border border-border/40 bg-card shadow-xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border/40 bg-card px-6 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold">Novidades</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg" aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-8 p-6">
              {RELEASE_NOTES.map((release) => (
                <div key={release.version}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
                      v{release.version}
                    </span>
                    <span className="text-xs text-muted-foreground">{release.date}</span>
                  </div>
                  <h3 className="mb-3 text-sm font-semibold">{release.title}</h3>
                  <ul className="space-y-2">
                    {release.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-0.5 shrink-0 text-primary">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
