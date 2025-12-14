'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { FloorPlanCanvas } from '@/components/admin/floor-plan-canvas'
import { FloorPlanToolbar } from '@/components/admin/floor-plan-toolbar'
import { FloorPlanSidePanel } from '@/components/admin/floor-plan-side-panel'
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFloorsQuery, useFloorLayoutQuery, useBatchUpdatePositionsMutation, useCreateTableMutation } from '@/hooks/use-tables-query'
import { toast } from 'sonner'
import type { FloorLayoutTable, TablePosition } from '@/types/tables'

export interface TableItem {
  id: string
  type: 'rectangle' | 'round'
  name: string
  seats: number
  area: string
  status: 'Available' | 'Occupied' | 'Waiting for bill' | 'Disabled'
  position: { x: number; y: number }
  rotation: number
  size: { width: number; height: number }
  canBeMerged: boolean
  notes?: string
}

// Map backend status to frontend status
function mapStatus(status: string): TableItem['status'] {
  const statusMap: Record<string, TableItem['status']> = {
    available: 'Available',
    occupied: 'Occupied',
    waiting_for_payment: 'Waiting for bill',
    maintenance: 'Disabled',
  }
  return statusMap[status] || 'Available'
}

// Map backend shape to frontend type
function mapShape(shape: string | null): 'rectangle' | 'round' {
  if (shape === 'circle' || shape === 'oval') return 'round'
  return 'rectangle'
}

// Transform backend FloorLayoutTable to TableItem
function transformTableToItem(table: FloorLayoutTable): TableItem {
  return {
    id: table.id,
    type: mapShape(table.type),
    name: table.name,
    seats: table.seats,
    area: table.area,
    status: mapStatus(table.status),
    position: table.position,
    rotation: 0,
    size: {
      width: table.type === 'circle' || table.type === 'oval' ? 120 : 120,
      height: table.type === 'circle' || table.type === 'oval' ? 120 : 80,
    },
    canBeMerged: table.type !== 'circle' && table.type !== 'oval',
  }
}

export default function TableLayoutPage() {
  const searchParams = useSearchParams()
  const floorParam = searchParams.get('floor')
  const tableIdParam = searchParams.get('tableId')

  const [selectedTableId, setSelectedTableId] = useState<string | null>(tableIdParam)
  const [selectedArea, setSelectedArea] = useState(floorParam || '')
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [history, setHistory] = useState<TableItem[][]>([])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Load floors and layout data
  const { data: floorsData } = useFloorsQuery()
  const floors = floorsData?.data?.floors || []
  const currentFloor = selectedArea || floors[0] || ''

  const { data: layoutData, isLoading: isLoadingLayout } = useFloorLayoutQuery(
    currentFloor || null,
    !!currentFloor,
  )

  // Transform backend data to TableItem format
  const tables = useMemo(() => {
    if (!layoutData?.data.tables) return []
    return layoutData.data.tables.map(transformTableToItem)
  }, [layoutData])

  const batchUpdateMutation = useBatchUpdatePositionsMutation()
  const createTableMutation = useCreateTableMutation()

  useEffect(() => {
    if (floorParam) {
      setSelectedArea(floorParam)
    }
  }, [floorParam])

  useEffect(() => {
    if (tableIdParam && tables.length > 0) {
      const table = tables.find((t) => t.id === tableIdParam)
      if (table) {
        setSelectedTableId(tableIdParam)
      }
    }
  }, [tableIdParam, tables])

  // Initialize history when tables load
  useEffect(() => {
    if (tables.length > 0 && history.length === 0) {
      setHistory([tables])
      setHistoryIndex(0)
    }
  }, [tables, history.length])

  const selectedTable = tables.find((t) => t.id === selectedTableId)

  const handleTableUpdate = (id: string, updates: Partial<TableItem>) => {
    // This is handled by the side panel component which calls the API directly
    // We just update local state for immediate UI feedback
    const newTables = tables.map((t) => (t.id === id ? { ...t, ...updates } : t))
    addToHistory(newTables)
  }

  const handleTableDelete = (id: string) => {
    // This is handled by the side panel component which calls the API directly
    // We just update local state for immediate UI feedback
    const newTables = tables.filter((t) => t.id !== id)
    setSelectedTableId(null)
    addToHistory(newTables)
  }

  const handleAddTable = async (tableTemplate: Omit<TableItem, 'id' | 'position' | 'area'>) => {
    try {
      const newTable = await createTableMutation.mutateAsync({
        table_number: tableTemplate.name,
        capacity: tableTemplate.seats,
        floor: currentFloor,
        shape: tableTemplate.type === 'round' ? 'circle' : 'rectangle',
        status: 'available',
        is_active: true,
        position: { x: 200, y: 200 },
      })

      toast.success('Bàn đã được tạo thành công')
      // The query will refetch automatically, so we don't need to update local state
    } catch (error: any) {
      console.error('Error creating table:', error)
      toast.error('Có lỗi xảy ra khi tạo bàn')
    }
  }

  const addToHistory = (newTables: TableItem[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newTables)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (historyIndex > 0 && history.length > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      // Note: We can't directly set tables since they come from API
      // Undo/redo would need to be handled differently with API integration
      // For now, we'll keep the history but tables will sync from API
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && history.length > 0) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      // Note: Same as undo - tables sync from API
    }
  }

  const handleSave = async () => {
    try {
      const updates = tables.map((table) => ({
        table_id: table.id,
        position: table.position,
      }))

      await batchUpdateMutation.mutateAsync({ updates })
      toast.success('Sơ đồ đã được lưu thành công')
    } catch (error: any) {
      console.error('Error saving layout:', error)
      toast.error('Có lỗi xảy ra khi lưu sơ đồ')
    }
  }

  const handleReset = () => {
    if (confirm('Bạn có chắc muốn reset layout về mặc định?')) {
      // Reset to initial state from API
      setHistory([])
      setHistoryIndex(0)
      setSelectedTableId(null)
      // Tables will be reloaded from API automatically
    }
  }

  if (isLoadingLayout) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải sơ đồ...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Toolbar */}
        <FloorPlanToolbar
          selectedArea={currentFloor}
          onAreaChange={(area) => {
            setSelectedArea(area)
            setSelectedTableId(null)
            setHistory([])
            setHistoryIndex(0)
          }}
          zoom={zoom}
          onZoomChange={setZoom}
          showGrid={showGrid}
          onShowGridChange={setShowGrid}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          onReset={handleReset}
        />

        {/* Main content: Canvas + Side Panel */}
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          {/* Canvas */}
          <FloorPlanCanvas
            tables={tables}
            selectedTableId={selectedTableId}
            onTableSelect={setSelectedTableId}
            onTableUpdate={(id, updates) => {
              // Update local state immediately for UI feedback
              handleTableUpdate(id, updates)
              // Debounce and batch save positions
              // This will be handled by a separate debounced save function if needed
            }}
            zoom={zoom}
            showGrid={showGrid}
            selectedArea={currentFloor}
          />

          {/* Side Panel */}
          <FloorPlanSidePanel
            selectedTable={selectedTable}
            onTableUpdate={handleTableUpdate}
            onTableDelete={handleTableDelete}
            onAddTable={handleAddTable}
            areas={floors}
          />
        </div>
      </div>
    </AdminLayout>
  )
}

