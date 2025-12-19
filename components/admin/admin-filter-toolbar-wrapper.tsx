'use client'

import type { ReactNode } from 'react'

interface AdminFilterToolbarWrapperProps {
  children: ReactNode
}

export function AdminFilterToolbarWrapper({ children }: AdminFilterToolbarWrapperProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900/80">
      {children}
    </div>
  )
}
