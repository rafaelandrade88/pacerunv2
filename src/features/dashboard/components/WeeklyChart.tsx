'use client'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Skeleton } from '@/components/ui/skeleton'
import type { DailyVolume } from '@/features/dashboard/services/DashboardService'

interface WeeklyChartProps { data?: DailyVolume[]; loading?: boolean }

export function WeeklyChart({ data, loading = false }: WeeklyChartProps) {
  if (loading) return (
    <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
      <Skeleton className="h-5 w-32" /><Skeleton className="h-[180px] w-full rounded-xl" />
    </div>
  )
  const hasData = data?.some((d) => d.km > 0)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Volume semanal</h3>
        <span className="text-xs text-muted-foreground">{data ? `${data.reduce((s, d) => s + d.km, 0).toFixed(2)} km total` : ''}</span>
      </div>
      {!hasData ? (
        <div className="flex h-[180px] items-center justify-center"><p className="text-sm text-muted-foreground">Nenhuma corrida esta semana ainda</p></div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barSize={28}>
            {/* Tokens são cores oklch completas (Tailwind v4) — hsl(var(...)) gera cor inválida */}
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}km`} width={48} />
            <Tooltip cursor={{ fill: 'var(--accent)', opacity: 0.4 }} formatter={(value) => [`${Number(value).toFixed(2)} km`, 'Distância']} contentStyle={{ background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
            <Bar dataKey="km" fill="var(--primary)" radius={[6, 6, 0, 0]} opacity={0.9} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  )
}
