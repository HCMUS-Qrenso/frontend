'use client'

import type React from 'react'
import { cn } from '@/lib/utils'
import { UtensilsCrossed, CheckCircle2, XCircle, EyeOff, Award } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtext: string
  icon: React.ReactNode
  className?: string
}

function StatCard({ title, value, subtext, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtext}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          {icon}
        </div>
      </div>
    </div>
  )
}

export function MenuItemsOverviewStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Tổng món"
        value="128"
        subtext="Đã tạo"
        icon={<UtensilsCrossed className="h-6 w-6" />}
      />
      <StatCard
        title="Đang bán"
        value="98"
        subtext="Available"
        icon={<CheckCircle2 className="h-6 w-6" />}
      />
      <StatCard
        title="Hết hàng"
        value="12"
        subtext="Sold out"
        icon={<XCircle className="h-6 w-6" />}
      />
      <StatCard
        title="Tạm ẩn"
        value="18"
        subtext="Unavailable"
        icon={<EyeOff className="h-6 w-6" />}
      />
      <StatCard
        title="Chef's picks"
        value="24"
        subtext="Recommendation"
        icon={<Award className="h-6 w-6" />}
      />
    </div>
  )
}
