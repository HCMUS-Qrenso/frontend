'use client'

import { Suspense } from 'react'
import { ZonesOverviewStats } from '@/components/admin/zones-overview-stats'
import { ZonesFilterToolbar } from '@/components/admin/zones-filter-toolbar'
import { ZonesTable } from '@/components/admin/zones-table'
import { ZoneUpsertModal } from '@/components/admin/zone-upsert-modal'
import { ZoneDeleteDialog } from '@/components/admin/zone-delete-dialog'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function ZonesContent() {
  const searchParams = useSearchParams()
  const modalOpen = searchParams.get('modal') === 'zone'

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <ZonesOverviewStats />

      {/* Filter Toolbar */}
      <ZonesFilterToolbar />

      {/* Zones Table */}
      <ZonesTable />

      {/* Modal for Create/Edit */}
      <ZoneUpsertModal open={modalOpen} />

      {/* Delete Confirmation Dialog */}
      <ZoneDeleteDialog />
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

export default function ZonesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ZonesContent />
    </Suspense>
  )
}
