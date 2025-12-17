'use client'

import { Suspense } from 'react'
import { TablesOverviewStats } from '@/components/admin/tables-overview-stats'
import { TablesFilterToolbar } from '@/components/admin/tables-filter-toolbar'
import { TablesListTable } from '@/components/admin/tables-list-table'
import { TableUpsertDrawer } from '@/components/admin/table-upsert-drawer'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

function TablesListContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const modalOpen = searchParams.get('modal') === 'table'

  // Get current tab from URL, default to 'active'
  const currentTab = searchParams.get('tab') || 'active'
  const isTrashView = currentTab === 'trash'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'active') {
      params.delete('tab')
    } else {
      params.set('tab', value)
    }
    // Reset page when switching tabs
    params.delete('page')
    router.push(`/admin/tables/list?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards - Overview stats - Only show for active tables */}
      <TablesOverviewStats />
      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="active">Danh sách bàn</TabsTrigger>
          <TabsTrigger value="trash">Lịch sử xóa bàn</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-6">
          {/* Filter Toolbar */}
          <TablesFilterToolbar isTrashView={false} />

          {/* Tables List Table */}
          <TablesListTable isTrashView={false} />
        </TabsContent>

        <TabsContent value="trash" className="mt-6 space-y-6">
          {/* Filter Toolbar */}
          <TablesFilterToolbar isTrashView={true} />

          {/* Tables List Table */}
          <TablesListTable isTrashView={true} />
        </TabsContent>
      </Tabs>

      {/* Modal for Create/Edit */}
      <TableUpsertDrawer open={modalOpen} />
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

export default function TablesListPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TablesListContent />
    </Suspense>
  )
}
