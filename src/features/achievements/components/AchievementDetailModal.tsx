'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, ImagePlus, Loader2, MapPin, Pencil, Timer, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Achievement } from '@/domain/entities/Achievement'
import { useAchievementMutations } from '@/features/achievements/hooks/useAchievements'

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

interface AchievementDetailModalProps {
  achievement: Achievement | null
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

export function AchievementDetailModal({ achievement, onClose }: AchievementDetailModalProps) {
  const open = Boolean(achievement)
  const { updateAchievement, deleteAchievement } = useAchievementMutations()
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [compressing, setCompressing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  })

  useEffect(() => {
    if (achievement) {
      setMode('view')
      setConfirmDelete(false)
      setSaveError(null)
      setThumbnail(achievement.thumbnailBase64 ?? null)
      reset({
        eventName: achievement.eventName,
        eventDate: achievement.eventDate,
        location: achievement.location ?? '',
        distance: achievement.distance ?? '',
        category: achievement.category ?? '',
        overallPosition: achievement.overallPosition ?? '',
        categoryPosition: achievement.categoryPosition ?? '',
        grossTime: achievement.grossTime ?? '',
        netTime: achievement.netTime ?? '',
      })
    }
  }, [achievement, reset])

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
    try { setThumbnail(await compressCertificate(file)) }
    catch { /* ignore */ } finally { setCompressing(false) }
  }

  async function onSubmit(data: FormData) {
    if (!achievement) return
    setSaveError(null)
    try {
      await updateAchievement.mutateAsync({
        id: achievement.id,
        data: {
          eventName: data.eventName,
          eventDate: data.eventDate ?? '',
          location: data.location,
          distance: data.distance,
          category: data.category,
          overallPosition: data.overallPosition,
          categoryPosition: data.categoryPosition,
          grossTime: data.grossTime,
          netTime: data.netTime,
          thumbnailBase64: thumbnail ?? undefined,
        },
      })
      setMode('view')
    } catch {
      setSaveError('Erro ao salvar. Tente novamente.')
    }
  }

  async function handleDelete() {
    if (!achievement) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    await deleteAchievement.mutateAsync(achievement.id)
    handleClose()
  }

  function handleClose() {
    setMode('view')
    setConfirmDelete(false)
    setSaveError(null)
    onClose()
  }

  const currentThumbnail = thumbnail ?? achievement?.thumbnailBase64

  return (
    <AnimatePresence>
      {open && achievement && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose} aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border/40 bg-card shadow-xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/40 bg-card px-5 py-4">
              <h2 className="text-base font-bold">{mode === 'edit' ? 'Editar conquista' : 'Detalhes'}</h2>
              <div className="flex items-center gap-1">
                {mode === 'view' && (
                  <Button variant="ghost" size="icon" onClick={() => setMode('edit')} className="h-8 w-8 rounded-lg" aria-label="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 rounded-lg" aria-label="Fechar">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* VIEW MODE */}
            {mode === 'view' && (
              <div className="p-5 space-y-5">
                {currentThumbnail && (
                  <div className="rounded-xl overflow-hidden border border-border/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentThumbnail} alt="Certificado" className="w-full max-h-72 object-contain bg-muted" />
                  </div>
                )}

                <div className="space-y-1">
                  <h3 className="text-xl font-bold">{achievement.eventName}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {achievement.eventDate && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />{achievement.eventDate}
                      </span>
                    )}
                    {achievement.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />{achievement.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {achievement.distance && (
                    <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Distância</p>
                      <p className="text-base font-bold">{achievement.distance}</p>
                    </div>
                  )}
                  {achievement.category && (
                    <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Categoria</p>
                      <p className="text-base font-bold">{achievement.category}</p>
                    </div>
                  )}
                  {achievement.netTime && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                      <p className="text-[10px] text-primary/70 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Timer className="h-3 w-3" />Tempo líquido
                      </p>
                      <p className="text-base font-bold font-mono text-primary">{achievement.netTime}</p>
                    </div>
                  )}
                  {achievement.grossTime && (
                    <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Tempo bruto</p>
                      <p className="text-base font-bold font-mono">{achievement.grossTime}</p>
                    </div>
                  )}
                  {achievement.overallPosition && (
                    <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Col. geral</p>
                      <p className="text-base font-bold">{achievement.overallPosition}º</p>
                    </div>
                  )}
                  {achievement.categoryPosition && (
                    <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Col. categoria</p>
                      <p className="text-base font-bold">{achievement.categoryPosition}º</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-3">
                  {confirmDelete ? (
                    <>
                      <p className="text-xs text-destructive">Confirmar remoção?</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteAchievement.isPending}>
                          {deleteAchievement.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Remover'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete}>
                        <Trash2 className="h-3.5 w-3.5" />Remover
                      </Button>
                      <Button onClick={() => setMode('edit')} className="gap-2">
                        <Pencil className="h-3.5 w-3.5" />Editar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* EDIT MODE */}
            {mode === 'edit' && (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-5 space-y-5">
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleImageChange} />

                {currentThumbnail ? (
                  <div className="relative rounded-xl overflow-hidden border border-border/40 cursor-pointer" onClick={() => fileRef.current?.click()}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentThumbnail} alt="Certificado" className="w-full max-h-64 object-contain bg-muted" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 rounded-xl">
                      <span className="text-white text-sm font-medium">Trocar imagem</span>
                    </div>
                    {compressing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 py-8 transition-colors hover:border-primary/50 hover:bg-primary/5">
                    {compressing ? <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" /> : (
                      <>
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-sm font-medium">Adicionar certificado</p>
                          <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG ou WEBP</p>
                        </div>
                      </>
                    )}
                  </button>
                )}

                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-eventName">Nome do evento <span className="text-destructive">*</span></Label>
                    <Input id="edit-eventName" {...register('eventName')} />
                    {errors.eventName && <p className="text-xs text-destructive">{errors.eventName.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-eventDate">Data</Label>
                      <Input id="edit-eventDate" placeholder="Ex: 05/07/26" {...register('eventDate')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-location">Local</Label>
                      <Input id="edit-location" placeholder="Ex: Guarulhos/SP" {...register('location')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-distance">Distância</Label>
                      <Input id="edit-distance" placeholder="Ex: 6KM" {...register('distance')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-category">Categoria</Label>
                      <Input id="edit-category" placeholder="Ex: M-31-40" {...register('category')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-overallPosition">Col. geral</Label>
                      <Input id="edit-overallPosition" placeholder="Ex: 530" {...register('overallPosition')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-categoryPosition">Col. categoria</Label>
                      <Input id="edit-categoryPosition" placeholder="Ex: 176" {...register('categoryPosition')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-grossTime">Tempo bruto</Label>
                      <Input id="edit-grossTime" placeholder="Ex: 00:45:09" {...register('grossTime')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-netTime">Tempo líquido</Label>
                      <Input id="edit-netTime" placeholder="Ex: 00:42:50" {...register('netTime')} />
                    </div>
                  </div>
                </div>

                {saveError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{saveError}</p>}

                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" onClick={() => setMode('view')} className="flex-1">Cancelar</Button>
                  <Button type="submit" disabled={isSubmitting || updateAchievement.isPending} className="flex-1">
                    {(isSubmitting || updateAchievement.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar alterações'}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
