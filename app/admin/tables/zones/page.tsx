'use client'

import { Suspense, useState } from 'react'
import { ZonesOverviewStats } from '@/src/features/admin/tables/components/zones/zones-overview-stats'
import { ZonesFilterToolbar } from '@/src/features/admin/tables/components/zones/zones-filter-toolbar'
import { ZonesTable } from '@/src/features/admin/tables/components/zones/zones-table'
import { ZoneUpsertModal } from '@/src/features/admin/tables/components/zones/zone-upsert-modal'
import { ZoneDeleteModal } from '@/src/features/admin/tables/components/zones/zone-delete-modal'
import { useSearchParams } from 'next/navigation'
import { Zone } from '@/src/features/admin/tables/types/zones'

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

export default function ZonesPage() {
  return (
    <Suspense fallback={null}>
      <ZonesContent />
    </Suspense>
  )
}

