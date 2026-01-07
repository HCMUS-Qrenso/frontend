'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/card'
import { cn } from '@/src/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface SettingsSectionProps {
  id: string
  title: string
  description?: string
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
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
}: SettingsSectionProps) {
  return (
    <Card id={id} className={cn('scroll-mt-6', className)}>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  )
}
