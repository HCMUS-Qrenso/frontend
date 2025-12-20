'use client'

import { Suspense } from 'react'
import { StaffTabs } from '@/components/admin/staff-tabs'
import { Loader2 } from 'lucide-react'

function StaffContent() {
  return (
    <div className="space-y-6">
      {/* Tabs with Data Tables */}
      <StaffTabs />
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

export default function StaffPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StaffContent />
    </Suspense>
  )
}
