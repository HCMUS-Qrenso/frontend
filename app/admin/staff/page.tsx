'use client'

import { Suspense } from 'react'
import { StaffTabs } from '@/src/features/admin/staff/components/staff-tabs'

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
    <Suspense fallback={null}>
      <StaffContent />
    </Suspense>
  )
}
