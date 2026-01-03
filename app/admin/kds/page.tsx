'use client'

import { Suspense } from 'react'
import { KdsBoardClient } from '@/src/features/admin/kds/components/kds-board-client'

function KdsContent() {
  return (
    <div className="space-y-6">
      <KdsBoardClient />
    </div>
  )
}

export default function KdsPage() {
  return (
    <Suspense fallback={null}>
      <KdsContent />
    </Suspense>
  )
}
