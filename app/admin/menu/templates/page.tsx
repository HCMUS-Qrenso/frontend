'use client'

import { Suspense } from 'react'
import { TemplateExportTab } from '@/src/features/admin/menu/components/templates/template-export-tab'
import { Loader2 } from 'lucide-react'

function TemplatesContent() {
  return (
    <div className="space-y-6">
      {/* Template Content */}
      <TemplateExportTab />
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  )
}

export default function MenuTemplatesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TemplatesContent />
    </Suspense>
  )
}
