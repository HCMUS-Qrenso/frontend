'use client'

import { Suspense, useState } from 'react'
import { MenuItemsOverviewStats } from '@/src/features/admin/menu/components/items/menu-items-overview-stats'
import { MenuItemsFilterToolbar } from '@/src/features/admin/menu/components/items/menu-items-filter-toolbar'
import { MenuItemsTable } from '@/src/features/admin/menu/components/items/menu-items-table'
import { MenuItemUpsertModal } from '@/src/features/admin/menu/components/items/menu-item-upsert-modal'
import { MenuItemDeleteDialog } from '@/src/features/admin/menu/components/items/menu-item-delete-dialog'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { MenuItem } from '@/src/features/admin/menu/types/menu-items'
import { Category } from '@/src/features/admin/menu/types/categories'
import { useCategoriesQuery } from '@/src/features/admin/menu/queries/categories.queries'

function MenuItemsContent() {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openUpsertModal, setOpenUpsertModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [upsertModalMode, setUpsertModalMode] = useState<'create' | 'edit'>('create')

  // Fetch categories from API
  const { data: categoriesData } = useCategoriesQuery()
  const categories = categoriesData?.data.categories || []

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <MenuItemsOverviewStats />

      {/* Filter Toolbar */}
      <MenuItemsFilterToolbar
        onCreateClick={() => {
          setUpsertModalMode('create')
          setOpenUpsertModal(true)
        }}
        categories={categories}
      />

      {/* Menu Items Table */}
      <MenuItemsTable
        onDeleteClick={(item: MenuItem) => {
          setSelectedItem(item)
          setOpenDeleteDialog(true)
        }}
        onEditClick={(item: MenuItem) => {
          setSelectedItem(item)
          setUpsertModalMode('edit')
          setOpenUpsertModal(true)
        }}
      />

      {/* Modal for Create/Edit */}
      <MenuItemUpsertModal
        item={selectedItem}
        categories={categories}
        mode={upsertModalMode}
        open={openUpsertModal}
        onOpenChange={setOpenUpsertModal}
      />

      {/* Delete Confirmation Dialog */}
      <MenuItemDeleteDialog
        item={selectedItem}
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
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

export default function MenuItemsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MenuItemsContent />
    </Suspense>
  )
}
