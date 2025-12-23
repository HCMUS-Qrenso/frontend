'use client'

import { Suspense, useState } from 'react'
import { TablesOverviewStats } from '@/components/admin/tables-overview-stats'
import { TablesFilterToolbar } from '@/components/admin/tables-filter-toolbar'
import { TablesListTable } from '@/components/admin/tables-list-table'
import { TableUpsertModal } from '@/components/admin/table-upsert-modal'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TableDeleteModal } from '@/components/admin/table-delete-modal'
import { Table } from '@/types/tables'
import { useZonesSimpleQuery } from '@/hooks/use-zones-query'
import { SimpleZone } from '@/types/zones'

function TablesListContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

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

  const { data: zonesData } = useZonesSimpleQuery()
  const zones: SimpleZone[] | undefined = zonesData?.zones

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [upsertModalOpen, setUpsertModalOpen] = useState(false)
  const [upsertModalMode, setUpsertModalMode] = useState<'create' | 'edit'>('create')

  return (
    <div className="space-y-6">
      {/* KPI Cards - Overview stats - Only show for active tables */}
      <TablesOverviewStats /> 

      {/* Toggle Buttons - Like Staff Page */}
      <div className="flex gap-2">
        <button
          onClick={() => handleTabChange('active')}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            currentTab === 'active'
              ? 'bg-emerald-500 text-white dark:bg-emerald-600'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
          )}
        >
          Danh sách bàn
        </button>
        <button
          onClick={() => handleTabChange('trash')}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            currentTab === 'trash'
              ? 'bg-emerald-500 text-white dark:bg-emerald-600'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
          )}
        >
          Lịch sử xóa bàn
        </button>
      </div>

      {/* Filter Toolbar */}
      <TablesFilterToolbar
        isTrashView={isTrashView}
        zones={zones}
        onCreate={() => {
          setUpsertModalMode('create')
          setUpsertModalOpen(true)
        }}
      />

      {/* Tables List Table */}
      <TablesListTable
        isTrashView={isTrashView}
        onEditClick={(table: Table) => {
          setSelectedTable(table)
          setUpsertModalMode('edit')
          setUpsertModalOpen(true)
        }}
        onDeleteClick={(table: Table) => {
          setSelectedTable(table)
          setDeleteModalOpen(true)
        }}
      />

      {/* Modal for Create/Edit */}
      <TableUpsertModal
        open={upsertModalOpen}
        mode={upsertModalMode}
        table={selectedTable}
        zones={zones}
        onOpenChange={setUpsertModalOpen}
      />

      <TableDeleteModal
        open={deleteModalOpen}
        table={selectedTable}
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

export default function TablesListPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TablesListContent />
    </Suspense>
  )
}
