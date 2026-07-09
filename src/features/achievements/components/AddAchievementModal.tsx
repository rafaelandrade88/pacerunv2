'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAchievementMutations } from '@/features/achievements/hooks/useAchievements'
import { useAuth } from '@/providers/AuthProvider'

const schema = z.object({
  eventName: z.string().min(1, 'Nome do evento obrigatório'),
  eventDate: z.string().optional(),
  location: z.string().optional(),
  distance: z.string().optional(),
  category: z.string().optional(),
  overallPosition: z.string().optional(),
  categoryPosition: z.string().optional(),
  grossTime: z.string().optional(),
  netTime: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface AddAchievementModalProps {
  open: boolean
  onClose: () => void
}

async function compressCertificate(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const maxW = 600
      const scale = Math.min(1, maxW / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Falha ao carregar imagem')) }
    img.src = url
  })
}

export function AddAchievementModal({ open, onClose }: AddAchievementModalProps) {
  const { user } = useAuth()
  const { addAchievement } = useAchievementMutations()
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [compressing, setCompressing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  })

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCompressing(true)
    try {
      setThumbnail(await compressCertificate(file))
    } catch { /* ignore */ } finally {
      setCompressing(false)
    }
  }

  async function onSubmit(data: FormData) {
    setSaveError(null)
    if (!user) {
      setSaveError('Usuário não autenticado. Tente fazer login novamente.')
      return
    }
    try {
      await addAchievement.mutateAsync({
        userId: user.uid,
        eventName: data.eventName,
        eventDate: data.eventDate ?? '',
        location: data.location,
        distance: data.distance,
        category: data.category,
        overallPosition: data.overallPosition,
        categoryPosition: data.categoryPosition,
        grossTime: data.grossTime,
        netTime: data.netTime,
        ...(thumbnail ? { thumbnailBase64: thumbnail } : {}),
      })
      handleClose()
    } catch (err) {
      setSaveError('Erro ao salvar. Verifique sua conexão e tente novamente.')
      console.error('Erro ao salvar conquista:', err)
    }
  }

  function handleClose() {
    reset()
    setThumbnail(null)
    setSaveError(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal aria-label="Adicionar conquista">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border/40 bg-card shadow-xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border/40 bg-card px-5 py-4 z-10">
              <h2 className="text-base font-bold">Adicionar conquista</h2>
              <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 rounded-lg" aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-5 space-y-5">
              {/* Image upload */}
              <div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleImageChange} />
                {thumbnail ? (
                  <div className="relative rounded-xl overflow-hidden border border-border/40 cursor-pointer" onClick={() => fileRef.current?.click()}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbnail} alt="Certificado" className="w-full max-h-64 object-contain bg-muted" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 rounded-xl">
                      <span className="text-white text-sm font-medium">Trocar imagem</span>
                    </div>
                    {compressing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 py-8 transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    {compressing ? (
                      <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                    ) : (
                      <>
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-sm font-medium">Importar certificado</p>
                          <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG ou WEBP</p>
                        </div>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Fields */}
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="eventName">Nome do evento <span className="text-destructive">*</span></Label>
                  <Input id="eventName" placeholder="Ex: Barbosa Run" {...register('eventName')} />
                  {errors.eventName && <p className="text-xs text-destructive">{errors.eventName.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="eventDate">Data</Label>
                    <Input id="eventDate" placeholder="Ex: 05/07/26" {...register('eventDate')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="location">Local</Label>
                    <Input id="location" placeholder="Ex: Guarulhos/SP" {...register('location')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="distance">Distância (modalidade)</Label>
                    <Input id="distance" placeholder="Ex: 6KM" {...register('distance')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Categoria</Label>
                    <Input id="category" placeholder="Ex: M-31-40" {...register('category')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="overallPosition">Col. geral</Label>
                    <Input id="overallPosition" placeholder="Ex: 530" {...register('overallPosition')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="categoryPosition">Col. categoria</Label>
                    <Input id="categoryPosition" placeholder="Ex: 176" {...register('categoryPosition')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="grossTime">Tempo bruto</Label>
                    <Input id="grossTime" placeholder="Ex: 00:45:09" {...register('grossTime')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="netTime">Tempo líquido</Label>
                    <Input id="netTime" placeholder="Ex: 00:42:50" {...register('netTime')} />
                  </div>
                </div>
              </div>

              {saveError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{saveError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || addAchievement.isPending} className="flex-1">
                  {(isSubmitting || addAchievement.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar conquista'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
