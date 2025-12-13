import { AdminLayout } from '@/components/admin/admin-layout'
import { TablesOverviewStats } from '@/components/admin/tables-overview-stats'
import { TablesFilterToolbar } from '@/components/admin/tables-filter-toolbar'
import { TablesListTable } from '@/components/admin/tables-list-table'

export default function TablesListPage() {
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
    </AdminLayout>
  )
}
