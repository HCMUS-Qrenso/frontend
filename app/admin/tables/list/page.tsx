'use client'

import { Suspense } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { TablesOverviewStats } from '@/components/admin/tables-overview-stats'
import { TablesFilterToolbar } from '@/components/admin/tables-filter-toolbar'
import { TablesListTable } from '@/components/admin/tables-list-table'
import { TableUpsertDrawer } from '@/components/admin/table-upsert-drawer'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function TablesListContent() {
  const searchParams = useSearchParams()
  const modalOpen = searchParams.get('modal') === 'table'

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* KPI Cards - Overview stats */}
        <TablesOverviewStats />

        {/* Filter Toolbar */}
        <TablesFilterToolbar />

        {/* Tables List Table */}
        <TablesListTable />
      </div>

      {/* Modal for Create/Edit */}
      <TableUpsertDrawer open={modalOpen} />
    </AdminLayout>
  )
}

function LoadingFallback() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    </AdminLayout>
  )
}

export default function TablesListPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TablesListContent />
    </Suspense>
  )
}
