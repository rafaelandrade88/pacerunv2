'use client'
import { Camera, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { env } from '@/config/env'
import { useProfileMutations } from '@/features/profile/hooks/useProfile'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/AuthProvider'

interface AvatarUploadProps { photoURL?: string | null; displayName?: string | null }

// Upload de avatar depende do Firebase Storage (plano Blaze) — controlado por NEXT_PUBLIC_ENABLE_AVATAR_UPLOAD
const uploadEnabled = env.NEXT_PUBLIC_ENABLE_AVATAR_UPLOAD

export function AvatarUpload({ photoURL, displayName }: AvatarUploadProps) {
  const { user } = useAuth()
  const { updateAvatar } = useProfileMutations()
  const [preview, setPreview] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const initials = displayName?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() ?? 'U'
  const isUploading = updateAvatar.isPending

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (!file.type.startsWith('image/')) return
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    setProgress(0)
    try {
      await updateAvatar.mutateAsync({ file, onProgress: (p) => setProgress(p) })
    } catch {
      setPreview(null)
    } finally {
      URL.revokeObjectURL(previewUrl)
      setProgress(0)
    }
  }

  return (
    <div className="relative inline-flex">
      <Avatar className="h-24 w-24">
        <AvatarImage src={preview ?? photoURL ?? undefined} alt={displayName ?? 'Usuário'} />
        <AvatarFallback className="text-2xl bg-primary/20 text-primary font-semibold">{initials}</AvatarFallback>
      </Avatar>
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
          {progress > 0 ? <span className="text-white text-xs font-bold">{progress}%</span> : <Loader2 className="h-5 w-5 text-white animate-spin" />}
        </div>
      )}
      {uploadEnabled && (
        <>
          <button type="button" onClick={() => !isUploading && inputRef.current?.click()} className={cn('absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90', isUploading && 'opacity-50 cursor-not-allowed')} aria-label="Alterar foto de perfil">
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFileChange} />
        </>
      )}
    </div>
  )
}
