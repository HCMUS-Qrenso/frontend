'use client'

import { Suspense } from 'react'
import { MenuItemsOverviewStats } from '@/components/admin/menu-items-overview-stats'
import { MenuItemsFilterToolbar } from '@/components/admin/menu-items-filter-toolbar'
import { MenuItemsTable } from '@/components/admin/menu-items-table'
import { MenuItemUpsertModal } from '@/components/admin/menu-item-upsert-modal'
import { MenuItemDeleteDialog } from '@/components/admin/menu-item-delete-dialog'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function MenuItemsContent() {
  const searchParams = useSearchParams()

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <MenuItemsOverviewStats />

      {/* Filter Toolbar */}
      <MenuItemsFilterToolbar />

      {/* Menu Items Table */}
      <MenuItemsTable />

      {/* Modal for Create/Edit */}
      <MenuItemUpsertModal />

      {/* Delete Confirmation Dialog */}
      <MenuItemDeleteDialog />
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

export default function MenuItemsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MenuItemsContent />
    </Suspense>
  )
}
