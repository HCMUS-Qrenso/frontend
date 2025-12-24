'use client'
import { FloorPlanCanvas } from '@/src/features/admin/tables/components/layout/floor-plan-canvas'
import { FloorPlanToolbar } from '@/src/features/admin/tables/components/layout/floor-plan-toolbar'
import { FloorPlanSidePanel } from '@/src/features/admin/tables/components/layout/floor-plan-side-panel'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  useZonesQuery,
  useZoneLayoutQuery,
  useBatchUpdatePositionsMutation,
  useCreateTableMutation,
  useUpdateTableMutation,
} from '@/src/features/admin/tables/queries/tables.queries'
import { toast } from 'sonner'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import type { ZoneLayoutTable, TablePosition } from '@/src/features/admin/tables/types/tables'
import { formatRotation } from '@/src/features/admin/tables/utils/table-utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { Loader2, AlertTriangle } from 'lucide-react'

export interface TableItem {
  id: string
  type: 'rectangle' | 'circle' | 'oval'
  name: string
  seats: number
  area: string
  status: 'Available' | 'Occupied' | 'Waiting for bill' | 'Disabled'
  position: TablePosition
  rotation: number // Kept for backward compatibility, should sync with position.rotation
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
function mapShape(shape: string | null): 'rectangle' | 'circle' | 'oval' {
  if (shape === 'circle') return 'circle'
  if (shape === 'oval') return 'oval'
  return 'rectangle' // default
}

// Calculate table size based on type and number of seats
function calculateTableSize(
  type: 'rectangle' | 'circle' | 'oval',
  seats: number,
): { width: number; height: number } {
  // Rectangle: width > height
  if (type === 'rectangle') {
    if (seats <= 2) return { width: 80, height: 80 }
    if (seats <= 4) return { width: 120, height: 80 }
    if (seats <= 6) return { width: 140, height: 80 }
    if (seats <= 8) return { width: 160, height: 100 }
    if (seats <= 10) return { width: 180, height: 100 }
    // 11+ seats: base 200x120, add 20px width and 20px height per 2 seats
    const extraSeats = seats - 10
    const extraSize = Math.floor(extraSeats / 2) * 20
    return { width: 200 + extraSize, height: 120 + extraSize }
  }

  // Circle: width === height
  if (type === 'circle') {
    if (seats <= 2) return { width: 80, height: 80 }
    if (seats <= 4) return { width: 100, height: 100 }
    if (seats <= 6) return { width: 120, height: 120 }
    if (seats <= 8) return { width: 140, height: 140 }
    if (seats <= 10) return { width: 160, height: 160 }
    // 11+ seats: base 180x180, add 20px per 2 seats
    const extraSeats = seats - 10
    const extraSize = Math.floor(extraSeats / 2) * 20
    return { width: 180 + extraSize, height: 180 + extraSize }
  }

  // Oval: width > height (similar to rectangle but rounded)
  if (type === 'oval') {
    if (seats <= 2) return { width: 90, height: 70 }
    if (seats <= 4) return { width: 130, height: 90 }
    if (seats <= 6) return { width: 150, height: 100 }
    if (seats <= 8) return { width: 170, height: 120 }
    if (seats <= 10) return { width: 190, height: 130 }
    // 11+ seats: base 210x150, add 20px width and 10px height per 2 seats
    const extraSeats = seats - 10
    const extraWidth = Math.floor(extraSeats / 2) * 20
    const extraHeight = Math.floor(extraSeats / 2) * 10
    return { width: 210 + extraWidth, height: 150 + extraHeight }
  }

  // Fallback
  return { width: 120, height: 80 }
}

// Transform backend ZoneLayoutTable to TableItem
function transformTableToItem(
  table: ZoneLayoutTable | (ZoneLayoutTable & { zone?: string }),
): TableItem {
  const tableType = mapShape(table.type)
  // Read rotation from API response (default to 0 if not present)
  const rawRotation = table.position?.rotation ?? 0
  const rotation = formatRotation(rawRotation)
  // Ensure position includes rotation
  const position: TablePosition = {
    x: table.position.x,
    y: table.position.y,
    rotation: rotation,
  }
  return {
    id: table.id,
    type: tableType,
    name: table.name,
    seats: table.seats,
    // Backend hiện trả field `zone` (zone name), còn type cũ là `area`
    area: (table as any).zone ?? (table as any).area ?? '',
    status: mapStatus(table.status),
    position: position,
    rotation: rotation, // Sync with position.rotation for backward compatibility
    size: calculateTableSize(tableType, table.seats),
    canBeMerged: tableType === 'rectangle',
  }
}

export default function TableLayoutPage() {
  const searchParams = useSearchParams()
  const zoneParam = searchParams.get('zone')
  const tableIdParam = searchParams.get('tableId')

  const [selectedTableId, setSelectedTableId] = useState<string | null>(tableIdParam)
  const [selectedZone, setSelectedZone] = useState(zoneParam || '')
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [positionChanges, setPositionChanges] = useState<Map<string, TablePosition>>(new Map())
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  // Load zones and layout data
  const { data: zonesData } = useZonesQuery()
  const zones = zonesData?.data?.zones || []

  // Derive current zone object, id and display name
  const currentZoneObj =
    zones.find((z) => z.id === selectedZone || z.name === selectedZone) || zones[0] || null
  const currentZoneId = currentZoneObj?.id || ''
  const currentZoneName = currentZoneObj?.name || currentZoneId

  const { data: layoutData, isLoading: isLoadingLayout, refetch: refetchLayout, isStale } = useZoneLayoutQuery(
    currentZoneId || null,
    !!currentZoneId,
  )
  const { handleError } = useErrorHandler()

  // Transform backend data to TableItem format
  const tablesFromApi = useMemo(() => {
    if (!layoutData?.data.tables) return []
    return layoutData.data.tables.map(transformTableToItem)
  }, [layoutData])

  // Local state for tables - this is the source of truth for UI
  const [localTables, setLocalTables] = useState<TableItem[]>([])
  const prevZoneRef = useRef<string>('')

  // 1. Reset state when zone changes
  useEffect(() => {
    if (prevZoneRef.current !== currentZoneId && prevZoneRef.current !== '') {
      // Zone đã thay đổi, reset local state
      setLocalTables([])
      setPositionChanges(new Map())
      setSelectedTableId(null)
    }
    prevZoneRef.current = currentZoneId
  }, [currentZoneId])

  // 2. Sync data from API when new data is available
  useEffect(() => {
    // Chỉ sync khi không đang loading và có dữ liệu (hoặc mảng rỗng)
    if (!isLoadingLayout && layoutData?.data) {
      const tables = layoutData.data.tables || []
      const newTables = tables.map(transformTableToItem)
      // Layout API đã filter theo zone_id nên có thể sync trực tiếp
      setLocalTables(newTables)
    }
  }, [layoutData, isLoadingLayout])

  // Use localTables instead of tables memo
  const tables = localTables

  // Memoize areas array
  const areas = useMemo(() => zones.map((z) => z.name || z.id), [zones])

  // Memoize selectedTable
  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId),
    [tables, selectedTableId],
  )

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

  // Sync zoneParam with selectedZone when zones data is loaded
  useEffect(() => {
    if (zoneParam && zones.length > 0) {
      // Tìm zone theo ID hoặc name
      const zone = zones.find((z) => z.id === zoneParam || z.name === zoneParam)
      if (zone) {
        // Set thành zone ID để tương thích với API và đảm bảo tìm được trong currentZoneObj
        setSelectedZone(zone.id)
      } else {
        // Nếu không tìm thấy, giữ nguyên zoneParam (có thể là invalid zone)
        setSelectedZone(zoneParam)
      }
    } else if (zoneParam) {
      // Nếu zones chưa load nhưng có zoneParam, set tạm thời
      setSelectedZone(zoneParam)
    }
  }, [zoneParam, zones])

  useEffect(() => {
    if (tableIdParam && tables.length > 0) {
      const table = tables.find((t) => t.id === tableIdParam)
      if (table) {
        setSelectedTableId(tableIdParam)
      }
    }
  }, [tableIdParam, tables])

  // Memoize addToHistory function
  const addToHistory = useCallback(
    (newTables: TableItem[]) => {
      // History functionality removed
    },
    [],
  )

  const handleTableUpdate = useCallback(
    (id: string, updates: Partial<TableItem>) => {
      // Track position changes for batch save (before processing)
      if (updates.position) {
        setPositionChanges((prev) => {
          const newMap = new Map(prev)
          // Get current table to preserve rotation if needed
          const currentTable = localTables.find((t) => t.id === id)
          const rawRotation =
            updates.position!.rotation ??
            currentTable?.position?.rotation ??
            currentTable?.rotation ??
            0
          const positionWithRotation: TablePosition = {
            x: updates.position!.x,
            y: updates.position!.y,
            rotation: formatRotation(rawRotation),
          }
          newMap.set(id, positionWithRotation)
          return newMap
        })
      }

      // Update localTables state directly for immediate UI feedback
      setLocalTables((prevTables) => {
        const newTables = prevTables.map((t) => {
          if (t.id === id) {
            // If position is being updated, preserve rotation if not explicitly provided
            if (updates.position && updates.position.rotation === undefined) {
              const preservedRotation = t.position.rotation ?? t.rotation ?? 0
              updates.position = {
                ...updates.position,
                rotation: formatRotation(preservedRotation),
              }
            }

            // If rotation field is updated, also update position.rotation
            if (updates.rotation !== undefined && updates.position === undefined) {
              updates.position = {
                ...t.position,
                rotation: formatRotation(updates.rotation),
              }
            }

            // Sync rotation field with position.rotation
            const updatedTable = { ...t, ...updates }
            if (updates.position?.rotation !== undefined) {
              updatedTable.rotation = formatRotation(updates.position.rotation)
            }

            // Recalculate size if type or seats changed
            if (updates.type !== undefined || updates.seats !== undefined) {
              updatedTable.size = calculateTableSize(updatedTable.type, updatedTable.seats)
            }

            return updatedTable
          }
          return t
        })
        return newTables
      })
    },
    [localTables, addToHistory],
  )

  const handleTableDelete = useCallback(
    (id: string) => {
      // This is handled by the side panel component which calls the API directly
      // We just update local state for immediate UI feedback
      setLocalTables((prevTables) => {
        const newTables = prevTables.filter((t) => t.id !== id)
        return newTables
      })
      setSelectedTableId(null)
    },
    [],
  )

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
    if (type === 'circle') return 'circle'
    if (type === 'oval') return 'oval'
    return 'rectangle'
  }

  const handleTableSave = useCallback(
    async (id: string, updates: Partial<TableItem>) => {
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
          // Find zone by name/id
          const zone = zones.find((z) => z.name === updates.area || z.id === updates.area)
          if (zone) {
            payload.zone_id = zone.id
          }
        }
        if (updates.status !== undefined) {
          payload.status = mapStatusToBackend(updates.status)
        }
        if (updates.type !== undefined) {
          payload.shape = mapShapeToBackend(updates.type)
        }
        if (updates.position !== undefined) {
          // Ensure position includes rotation (use from position or fallback to rotation field)
          const rotation = updates.position.rotation ?? table.rotation ?? 0
          payload.position = {
            x: updates.position.x,
            y: updates.position.y,
            rotation: formatRotation(rotation),
          }
        }

        await updateTableMutation.mutateAsync({ id, payload })
        toast.success('Bàn đã được cập nhật thành công')

        // Update local state for immediate UI feedback
        handleTableUpdate(id, updates)
      } catch (error: any) {
        handleError(error, 'Có lỗi xảy ra khi cập nhật bàn')
      }
    },
    [tables, zones, updateTableMutation, handleError, handleTableUpdate],
  )

  const handleTableRemove = useCallback(
    async (id: string) => {
      // Move table back to library by setting position to -1,-1 (reset rotation to 0)
      await handleTableSave(id, { position: { x: -1, y: -1, rotation: formatRotation(0) } })
      setSelectedTableId(null)
    },
    [handleTableSave],
  )

  const handleAddTable = useCallback(
    async (tableTemplate: Omit<TableItem, 'id' | 'position' | 'area'>) => {
      try {
        const newTable = await createTableMutation.mutateAsync({
          table_number: tableTemplate.name,
          capacity: tableTemplate.seats,
          zone_id: currentZoneObj?.id || currentZoneId,
          shape: mapShapeToBackend(tableTemplate.type) as 'circle' | 'rectangle' | 'oval',
          status: 'available',
          is_active: true,
          position: { x: -1, y: -1, rotation: formatRotation(0) },
        })

        toast.success('Bàn đã được tạo thành công')
        // The query will refetch automatically, so we don't need to update local state
      } catch (error: any) {
        handleError(error, 'Có lỗi xảy ra khi tạo bàn')
      }
    },
    [currentZoneObj, currentZoneId, createTableMutation, handleError],
  )

  const handleSave = useCallback(async () => {
    try {
      // Only send tables with position changes
      if (positionChanges.size === 0) {
        toast.info('Không có thay đổi nào để lưu')
        return
      }

      const updates = Array.from(positionChanges.entries()).map(([tableId, position]) => {
        // Ensure position includes rotation
        const table = tables.find((t) => t.id === tableId)
        const rotation = position.rotation ?? table?.rotation ?? 0
        return {
          table_id: tableId,
          position: {
            x: position.x,
            y: position.y,
            rotation: formatRotation(rotation),
          },
        }
      })

      await batchUpdateMutation.mutateAsync({ updates })
      toast.success('Sơ đồ đã được lưu thành công')

      // Clear position changes after successful save
      setPositionChanges(new Map())
    } catch (error: any) {
      handleError(error, 'Có lỗi xảy ra khi lưu sơ đồ')
    }
  }, [positionChanges, tables, batchUpdateMutation, handleError])

  const handleReset = useCallback(() => {
    setResetDialogOpen(true)
  }, [])

  const handleResetLayout = useCallback(async () => {
    let dataToUse = layoutData
    if (isStale) {
      const { data } = await refetchLayout()
      dataToUse = data
    }
    const freshTables = dataToUse?.data.tables ? dataToUse.data.tables.map(transformTableToItem) : []
    setLocalTables(freshTables)
    setPositionChanges(new Map())
    setSelectedTableId(null)
  }, [layoutData, isStale, refetchLayout])

  const handleConfirmReset = useCallback(async () => {
    try {
      // Batch update API doesn't support null positions, so use individual PUT requests
      // Send -1,-1 position to move tables back to library (reset rotation to 0)
      const updatePromises = localTables.map((table) =>
        updateTableMutation.mutateAsync({
          id: table.id,
          payload: { position: { x: -1, y: -1, rotation: formatRotation(0) } }, // Send -1,-1 to move to library
        } as any),
      )
      await Promise.all(updatePromises)

      toast.success('Layout đã được đặt lại thành công')

      // Update localTables to remove positions (set to -1,-1 so they appear in library)
      // After reset, tables should disappear from layout and appear in library
      setLocalTables((prevTables) =>
        prevTables.map((table) => ({
          ...table,
          position: { x: -1, y: -1, rotation: 0 },
        })),
      )

      // Clear local state
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
  }, [localTables, updateTableMutation, handleError])

  // Memoize onAreaChange callback
  const handleAreaChange = useCallback(
    (area: string) => {
      // Find zone by name or use as ID
      const zone = zones.find((z) => z.name === area || z.id === area)
      // Lưu id để gọi API, nhưng hiển thị tên trong dropdown
      setSelectedZone(zone?.id || area)
      setSelectedTableId(null)
      setPositionChanges(new Map())
      // localTables will sync automatically via useEffect when currentZone changes
    },
    [zones],
  )

  // Memoize onTableUpdate callback for canvas
  const handleCanvasTableUpdate = useCallback(
    (id: string, updates: Partial<TableItem>) => {
      // Update local state immediately for UI feedback
      handleTableUpdate(id, updates)
      // Debounce and batch save positions
      // This will be handled by a separate debounced save function if needed
    },
    [handleTableUpdate],
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <FloorPlanToolbar
        selectedArea={currentZoneName}
        areas={areas}
        onAreaChange={handleAreaChange}
        zoom={zoom}
        onZoomChange={setZoom}
        showGrid={showGrid}
        onShowGridChange={setShowGrid}
        onSave={handleSave}
        onReset={handleReset}
        isLoading={isLoadingLayout}
      />

      {/* Main content: Canvas + Side Panel */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        {/* Canvas */}
        <FloorPlanCanvas
          tables={tables}
          selectedTableId={selectedTableId}
          onTableSelect={setSelectedTableId}
          onTableUpdate={handleCanvasTableUpdate}
          zoom={zoom}
          onZoomChange={setZoom}
          showGrid={showGrid}
          selectedArea={currentZoneName}
          onTableRemove={handleTableRemove}
          isLoading={isLoadingLayout}
          onReset={handleResetLayout}
        />

        {/* Side Panel */}
        <FloorPlanSidePanel
          selectedTable={selectedTable}
          onTableUpdate={handleTableUpdate}
          onTableSave={handleTableSave}
          onTableDelete={handleTableDelete}
          onAddTable={handleAddTable}
          areas={zones.map((z) => z.name || z.id)}
          libraryTables={libraryTables}
        />
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
    </div>
  )
}
