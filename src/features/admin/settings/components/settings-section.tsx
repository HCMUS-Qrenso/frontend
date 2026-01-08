'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/card'
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
    <Card id={id} className={cn('scroll-mt-6', comingSoon && 'opacity-75', className)}>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Icon className="text-primary h-5 w-5" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{title}</CardTitle>
              {comingSoon && (
                <Badge className="bg-amber-100 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400">
                  Coming Soon
                </Badge>
              )}
            </div>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  )
}
