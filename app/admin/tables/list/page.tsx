'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { TablesOverviewStats } from '@/components/admin/tables-overview-stats'
import { TablesFilterToolbar } from '@/components/admin/tables-filter-toolbar'
import { TablesListTable } from '@/components/admin/tables-list-table'
import { TableUpsertDrawer } from '@/components/admin/table-upsert-drawer'
import { TableDeleteDialog } from '@/components/admin/table-delete-dialog'
import { useSearchParams } from 'next/navigation'

export default function TablesListPage() {
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

      {/* Delete Confirmation Dialog */}
      <TableDeleteDialog />
    </AdminLayout>
  )
}
