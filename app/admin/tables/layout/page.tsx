'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { FloorPlanCanvas } from '@/components/admin/floor-plan-canvas'
import { FloorPlanToolbar } from '@/components/admin/floor-plan-toolbar'
import { FloorPlanSidePanel } from '@/components/admin/floor-plan-side-panel'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  useFloorsQuery,
  useFloorLayoutQuery,
  useBatchUpdatePositionsMutation,
  useCreateTableMutation,
  useUpdateTableMutation,
} from '@/hooks/use-tables-query'
import { toast } from 'sonner'
import { useErrorHandler } from '@/hooks/use-error-handler'
import type { FloorLayoutTable, TablePosition } from '@/types/tables'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, AlertTriangle } from 'lucide-react'

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
  const [positionChanges, setPositionChanges] = useState<Map<string, TablePosition>>(new Map())
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  // Load floors and layout data
  const { data: floorsData } = useFloorsQuery()
  const floors = floorsData?.data?.floors || []
  const currentFloor = selectedArea || floors[0] || ''

  const { data: layoutData, isLoading: isLoadingLayout } = useFloorLayoutQuery(
    currentFloor || null,
    !!currentFloor,
  )
  const { handleError } = useErrorHandler()

  // Transform backend data to TableItem format
  const tablesFromApi = useMemo(() => {
    if (!layoutData?.data.tables) return []
    return layoutData.data.tables.map(transformTableToItem)
  }, [layoutData])

  // Local state for tables - this is the source of truth for UI
  const [localTables, setLocalTables] = useState<TableItem[]>([])
  const prevFloorRef = useRef<string>('')

  // 1. Reset state when floor changes
  useEffect(() => {
    if (prevFloorRef.current !== currentFloor && prevFloorRef.current !== '') {
      // Floor đã thay đổi, reset local state
      setLocalTables([])
      setHistory([])
      setHistoryIndex(0)
      setPositionChanges(new Map())
      setSelectedTableId(null)
    }
    prevFloorRef.current = currentFloor
  }, [currentFloor])

  // 2. Sync data from API when new data is available
  useEffect(() => {
    // Chỉ sync khi không đang loading và có dữ liệu (hoặc mảng rỗng)
    if (!isLoadingLayout && layoutData?.data) {
      const tables = layoutData.data.tables || []
      const newTables = tables.map(transformTableToItem)
      // Đảm bảo dữ liệu match với currentFloor (hoặc không có bàn nào)
      const allMatchFloor =
        newTables.length === 0 || newTables.every((t) => t.area === currentFloor)
      if (allMatchFloor) {
        setLocalTables(newTables)
      }
    }
  }, [layoutData, isLoadingLayout, currentFloor])

  // Use localTables instead of tables memo
  const tables = localTables

  // Filter tables without positions (not in layout or position is null/-1,-1)
  const libraryTables = useMemo(() => {
    return tables.filter((table) => {
      const pos: any = (table as any).position
      if (!pos) return true
      return pos.x === -1 && pos.y === -1
    })
  }, [tables])

  const batchUpdateMutation = useBatchUpdatePositionsMutation()
  const createTableMutation = useCreateTableMutation()
  const updateTableMutation = useUpdateTableMutation()

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
    // Track position changes for batch save
    if (updates.position) {
      setPositionChanges((prev) => {
        const newMap = new Map(prev)
        newMap.set(id, updates.position!)
        return newMap
      })
    }

    // Update localTables state directly for immediate UI feedback
    setLocalTables((prevTables) => {
      const newTables = prevTables.map((t) => (t.id === id ? { ...t, ...updates } : t))
      addToHistory(newTables)
      return newTables
    })
  }

  const handleTableDelete = (id: string) => {
    // This is handled by the side panel component which calls the API directly
    // We just update local state for immediate UI feedback
    setLocalTables((prevTables) => {
      const newTables = prevTables.filter((t) => t.id !== id)
      addToHistory(newTables)
      return newTables
    })
    setSelectedTableId(null)
  }

  // Map frontend status to backend status
  const mapStatusToBackend = (status: TableItem['status']): string => {
    const statusMap: Record<TableItem['status'], string> = {
      Available: 'available',
      Occupied: 'occupied',
      'Waiting for bill': 'waiting_for_payment',
      Disabled: 'maintenance',
    }
    return statusMap[status] || 'available'
  }

  // Map frontend shape to backend shape
  const mapShapeToBackend = (type: TableItem['type']): string => {
    return type === 'round' ? 'circle' : 'rectangle'
  }

  const handleTableSave = async (id: string, updates: Partial<TableItem>) => {
    try {
      const table = tables.find((t) => t.id === id)
      if (!table) return

      const payload: any = {}

      if (updates.name !== undefined) {
        payload.table_number = updates.name
      }
      if (updates.seats !== undefined) {
        payload.capacity = updates.seats
      }
      if (updates.area !== undefined) {
        payload.floor = updates.area
      }
      if (updates.status !== undefined) {
        payload.status = mapStatusToBackend(updates.status)
      }
      if (updates.type !== undefined) {
        payload.shape = mapShapeToBackend(updates.type)
      }
      if (updates.position !== undefined) {
        payload.position = updates.position
      }

      await updateTableMutation.mutateAsync({ id, payload })
      toast.success('Bàn đã được cập nhật thành công')

      // Update local state for immediate UI feedback
      handleTableUpdate(id, updates)
    } catch (error: any) {
      handleError(error, 'Có lỗi xảy ra khi cập nhật bàn')
    }
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
        position: { x: -1, y: -1 },
      })

      toast.success('Bàn đã được tạo thành công')
      // The query will refetch automatically, so we don't need to update local state
    } catch (error: any) {
      handleError(error, 'Có lỗi xảy ra khi tạo bàn')
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
      // Only send tables with position changes
      if (positionChanges.size === 0) {
        toast.info('Không có thay đổi nào để lưu')
        return
      }

      const updates = Array.from(positionChanges.entries()).map(([tableId, position]) => ({
        table_id: tableId,
        position,
      }))

      await batchUpdateMutation.mutateAsync({ updates })
      toast.success('Sơ đồ đã được lưu thành công')

      // Clear position changes after successful save
      setPositionChanges(new Map())
    } catch (error: any) {
      handleError(error, 'Có lỗi xảy ra khi lưu sơ đồ')
    }
  }

  const handleReset = () => {
    setResetDialogOpen(true)
  }

  const handleConfirmReset = async () => {
    try {
      // Batch update API doesn't support null positions, so use individual PUT requests
      // Send -1,-1 position to move tables back to library
      const updatePromises = localTables.map((table) =>
        updateTableMutation.mutateAsync({
          id: table.id,
          payload: { position: { x: -1, y: -1 } }, // Send -1,-1 to move to library
        } as any),
      )
      await Promise.all(updatePromises)

      toast.success('Layout đã được đặt lại thành công')

      // Update localTables to remove positions (set to -1,-1 so they appear in library)
      // After reset, tables should disappear from layout and appear in library
      setLocalTables((prevTables) =>
        prevTables.map((table) => ({
          ...table,
          position: { x: -1, y: -1 },
        })),
      )

      // Clear local state
      setHistory([])
      setHistoryIndex(0)
      setSelectedTableId(null)
      setPositionChanges(new Map())
      setResetDialogOpen(false)

      // Tables will be reloaded from API automatically via query invalidation
      // When layoutData updates, localTables will sync (but only if floor changes)
      // So we need to manually sync here after reset
      // Actually, let's wait for the refetch and sync then
    } catch (error: any) {
      handleError(error, 'Có lỗi xảy ra khi đặt lại layout')
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
          areas={floors}
          onAreaChange={(area) => {
            setSelectedArea(area)
            setSelectedTableId(null)
            setHistory([])
            setHistoryIndex(0)
            setPositionChanges(new Map())
            // localTables will sync automatically via useEffect when currentFloor changes
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
            onTableSave={handleTableSave}
            onTableDelete={handleTableDelete}
            onAddTable={handleAddTable}
            areas={floors}
            libraryTables={libraryTables}
          />
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-center text-lg font-semibold text-slate-900 dark:text-white">
              Đặt lại layout?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400">
              Tất cả vị trí bàn sẽ được xóa và các bàn sẽ quay về thư viện. Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-3 sm:flex-row">
            <AlertDialogCancel
              disabled={batchUpdateMutation.isPending || updateTableMutation.isPending}
              className="m-0 rounded-full"
              onClick={() => setResetDialogOpen(false)}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReset}
              disabled={batchUpdateMutation.isPending || updateTableMutation.isPending}
              className="m-0 gap-2 rounded-full bg-red-600 hover:bg-red-700"
            >
              {(batchUpdateMutation.isPending || updateTableMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {batchUpdateMutation.isPending || updateTableMutation.isPending
                ? 'Đang đặt lại...'
                : 'Đặt lại'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
