'use client'
import { useEffect, useState } from 'react'

import { CURRENT_VERSION } from '@/data/releaseNotes'

const STORAGE_KEY = 'pacerun_last_seen_version'

export function useReleaseNotes() {
  const [hasUnread, setHasUnread] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY)
    if (lastSeen !== CURRENT_VERSION) setHasUnread(true)
  }, [])

  function markAsRead() {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION)
    setHasUnread(false)
  }

  function open() {
    setIsOpen(true)
    markAsRead()
  }

  return { hasUnread, isOpen, open, close: () => setIsOpen(false) }
}
