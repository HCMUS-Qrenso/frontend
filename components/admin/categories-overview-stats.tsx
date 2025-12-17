'use client'

import type React from 'react'

import { cn } from '@/lib/utils'
import { FolderOpen, Eye, EyeOff } from 'lucide-react'

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

export function CategoriesOverviewStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Tổng danh mục"
        value="12"
        subtext="Đã tạo"
        icon={<FolderOpen className="h-6 w-6" />}
      />
      <StatCard
        title="Đang hiển thị"
        value="10"
        subtext="Active"
        icon={<Eye className="h-6 w-6" />}
      />
      <StatCard title="Đang ẩn" value="2" subtext="Hidden" icon={<EyeOff className="h-6 w-6" />} />
    </div>
  )
}
