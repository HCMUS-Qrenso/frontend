'use client'

import { Suspense, useState } from 'react'
import { CategoriesOverviewStats } from '@/src/features/admin/menu/components/categories/categories-overview-stats'
import { CategoriesFilterToolbar } from '@/src/features/admin/menu/components/categories/categories-filter-toolbar'
import { CategoriesTable } from '@/src/features/admin/menu/components/categories/categories-table'
import { CategoryUpsertModal } from '@/src/features/admin/menu/components/categories/category-upsert-modal'
import { CategoryDeleteDialog } from '@/src/features/admin/menu/components/categories/category-delete-dialog'
import { Loader2 } from 'lucide-react'
import { Category } from '@/src/features/admin/menu/types/categories'

function CategoriesContent() {
  const [reorderMode, setReorderMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openUpsertModal, setOpenUpsertModal] = useState(false)
  const [upsertModalMode, setUpsertModalMode] = useState<'create' | 'edit'>('create')

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <CategoriesOverviewStats />

      {/* Filter Toolbar */}
      <CategoriesFilterToolbar
        reorderMode={reorderMode}
        setReorderMode={setReorderMode}
        onCreateClick={() => {
          setOpenUpsertModal(true)
          setUpsertModalMode('create')
        }}
      />

      {/* Categories Table */}
      <CategoriesTable
        reorderMode={reorderMode}
        setReorderMode={setReorderMode}
        onDeleteClick={(category) => {
          setSelectedCategory(category)
          setOpenDeleteDialog(true)
        }}
        onEditClick={(category) => {
          setSelectedCategory(category)
          setOpenUpsertModal(true)
          setUpsertModalMode('edit')
        }}
      />

      {/* Modal for Create/Edit */}
      <CategoryUpsertModal
        open={openUpsertModal}
        mode={upsertModalMode}
        category={selectedCategory}
        onOpenChange={setOpenUpsertModal}
      />

      {/* Delete Confirmation Dialog */}
      <CategoryDeleteDialog
        category={selectedCategory}
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

export default function CategoriesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CategoriesContent />
    </Suspense>
  )
}
