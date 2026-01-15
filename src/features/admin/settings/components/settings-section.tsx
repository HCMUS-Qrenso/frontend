'use client'

import { Badge } from '@/src/components/ui/badge'
import { cn } from '@/src/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface SettingsSectionProps {
  id: string
  title: string
  description?: string
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
  comingSoon?: boolean
}

/**
 * Reusable settings section component with consistent styling
 */
export function SettingsSection({
  id,
  title,
  description,
  icon: Icon,
  children,
  className,
  comingSoon,
}: SettingsSectionProps) {
  return (
    <div
      id={id}
      className={cn(
        'scroll-mt-6 rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80',
        comingSoon && 'opacity-75',
        className,
      )}
    >
      {/* Header */}
      <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Icon className="text-primary h-5 w-5" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
              {comingSoon && (
                <Badge className="bg-amber-100 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400">
                  Coming Soon
                </Badge>
              )}
            </div>
            {description && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  )
}
