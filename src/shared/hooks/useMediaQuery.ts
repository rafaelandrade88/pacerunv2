'use client'
import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])
  return matches
}

export const BREAKPOINTS = {
  sm: '(min-width: 640px)', md: '(min-width: 768px)',
  lg: '(min-width: 1024px)', xl: '(min-width: 1280px)', '2xl': '(min-width: 1536px)',
} as const
