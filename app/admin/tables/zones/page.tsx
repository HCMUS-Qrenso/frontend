'use client'

import { Suspense, useState } from 'react'
import { ZonesOverviewStats } from '@/components/admin/zones-overview-stats'
import { ZonesFilterToolbar } from '@/components/admin/zones-filter-toolbar'
import { ZonesTable } from '@/components/admin/zones-table'
import { ZoneUpsertModal } from '@/components/admin/zone-upsert-modal'
import { ZoneDeleteModal } from '@/components/admin/zone-delete-modal'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Zone } from '@/types/zones'

function ZonesContent() {
  const searchParams = useSearchParams()
  const [upsertModalOpen, setUpsertModalOpen] = useState(false)
  const [upsertModalMode, setUpsertModalMode] = useState<'create' | 'edit'>('create')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <ZonesOverviewStats />

      {/* Filter Toolbar */}
      <ZonesFilterToolbar
        onCreateZone={() => {
          setUpsertModalMode('create')
          setUpsertModalOpen(true)
        }}
      />

      {/* Zones Table */}
      <ZonesTable
        onEdit={(zone) => {
          setSelectedZone(zone)
          setUpsertModalMode('edit')
          setUpsertModalOpen(true)
        }}
        onDelete={(zone) => {
          setSelectedZone(zone)
          setDeleteModalOpen(true)
        }}
      />

      {/* Modal for Create/Edit */}
      <ZoneUpsertModal
        open={upsertModalOpen}
        mode={upsertModalMode}
        zone={selectedZone}
        onOpenChange={setUpsertModalOpen}
      />

      {/* Modal for Delete */}
      <ZoneDeleteModal
        open={deleteModalOpen}
        zone={selectedZone}
        onOpenChange={setDeleteModalOpen}
      />
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
