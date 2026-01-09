'use client'

import { Suspense } from 'react'
import { StaffTabs } from '@/src/features/admin/staff/components/staff-tabs'
import { PageContentSkeleton } from '@/src/components/loading'

function StaffContent() {
  return (
    <div className="space-y-6">
      {/* Tabs with Data Tables */}
      <StaffTabs />
    </div>
  )
}

export default function StaffPage() {
  return (
    <Suspense fallback={<PageContentSkeleton />}>
      <StaffContent />
    </Suspense>
  )
}

