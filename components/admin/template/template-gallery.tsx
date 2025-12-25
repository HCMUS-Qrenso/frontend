'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { on } from 'events'

type Template = {
  id: string
  name: string
  thumbnail: string
  tags: string[]
  description: string
  format: string
}

interface TemplateGalleryProps {
  templates: Template[]
  onSelectTemplate?: (id: string) => void
}

export function TemplateGallery({ templates, onSelectTemplate }: TemplateGalleryProps) {
  const router = useRouter()

  return (
    <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Chọn template thiết kế
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Các mẫu menu đẹp, print-ready cho nhà hàng
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="group overflow-hidden rounded-xl border border-slate-200 transition-all hover:border-emerald-500 hover:shadow-lg dark:border-slate-800 dark:hover:border-emerald-600 flex flex-col h-full"
          >
            <div className="relative aspect-3/4 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={template.thumbnail || '/placeholder.jpg'}
                alt={template.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h4 className="font-medium text-slate-900 dark:text-white">{template.name}</h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex-1">
                {template.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={() => onSelectTemplate?.(template.id)}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
                size="sm"
              >
                Dùng template này
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}