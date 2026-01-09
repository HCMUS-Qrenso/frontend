'use client'

import { Suspense } from 'react'
import { KdsBoardClient } from '@/src/features/admin/kds/components/kds-board-client'
import { KdsPageSkeleton } from '@/src/components/loading'

function KdsContent() {
  return (
    <div className="space-y-6">
      <KdsBoardClient />
    </div>
  )
}

export default function KdsPage() {
  return (
    <Suspense fallback={<KdsPageSkeleton />}>
      <KdsContent />
    </Suspense>
  )
}
