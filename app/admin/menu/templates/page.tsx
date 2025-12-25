'use client'

import { Suspense } from 'react'
import { TemplateExportTab } from '@/src/features/admin/menu/components/templates/template-export-tab'

function TemplatesContent() {
  return (
    <div className="space-y-6">
      {/* Template Content */}
      <TemplateExportTab />
    </div>
  )
}

export default function MenuTemplatesPage() {
  return (
    <Suspense fallback={null}>
      <TemplatesContent />
    </Suspense>
  )
}

