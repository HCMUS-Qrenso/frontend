'use client'

import { Suspense, useState } from 'react'
import { CategoriesOverviewStats } from '@/components/admin/categories-overview-stats'
import { CategoriesFilterToolbar } from '@/components/admin/categories-filter-toolbar'
import { CategoriesTable } from '@/components/admin/categories-table'
import { CategoryUpsertModal } from '@/components/admin/category-upsert-modal'
import { CategoryDeleteDialog } from '@/components/admin/category-delete-dialog'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function CategoriesContent() {
  const searchParams = useSearchParams()
  const modalOpen = searchParams.get('modal') === 'category'
  const [reorderMode, setReorderMode] = useState(false)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <CategoriesOverviewStats />

      {/* Filter Toolbar */}
      <CategoriesFilterToolbar reorderMode={reorderMode} setReorderMode={setReorderMode} />

      {/* Categories Table */}
      <CategoriesTable reorderMode={reorderMode} setReorderMode={setReorderMode} />

      {/* Modal for Create/Edit */}
      <CategoryUpsertModal open={modalOpen} />

      {/* Delete Confirmation Dialog */}
      <CategoryDeleteDialog />
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
