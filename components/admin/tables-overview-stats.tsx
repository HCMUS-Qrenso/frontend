"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { LayoutGrid, CheckCircle2, Users2, Clock } from "lucide-react"

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
        "group rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtext}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          {icon}
        </div>
      </div>
    </div>
  )
}

export function TablesOverviewStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Tổng số bàn" value="42" subtext="Đã cấu hình" icon={<LayoutGrid className="h-6 w-6" />} />
      <StatCard title="Bàn trống" value="18" subtext="Available" icon={<CheckCircle2 className="h-6 w-6" />} />
      <StatCard title="Đang phục vụ" value="20" subtext="Occupied" icon={<Users2 className="h-6 w-6" />} />
      <StatCard title="Chờ thanh toán" value="4" subtext="Waiting for bill" icon={<Clock className="h-6 w-6" />} />
    </div>
  )
}
