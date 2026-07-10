'use client'
import { MotionConfig } from 'framer-motion'

/**
 * reducedMotion="user": o Framer Motion desativa animações de transform/layout
 * quando o sistema operacional está com "reduzir movimento" ativado.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
