'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  useZonesQuery,
  useZoneLayoutQuery,
  useBatchUpdatePositionsMutation,
  useCreateTableMutation,
  useUpdateTableMutation,
} from '@/src/features/admin/tables/queries'
import { toast } from 'sonner'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import type { TablePosition } from '@/src/features/admin/tables/types/tables'
import { formatRotation } from '@/src/features/admin/tables/utils/table-utils'
import {
  type TableItem,
  transformTableToItem,
  calculateTableSize,
  mapStatusToBackend,
  mapShapeToBackend,
} from '@/src/features/admin/tables/utils/layout-transforms'

interface UseTableLayoutOptions {
  initialZone?: string | null
  initialTableId?: string | null
}

interface UseTableLayoutReturn {
  // Data
  tables: TableItem[]
  zones: { id: string; name: string }[]
  areas: string[]
  selectedTable: TableItem | undefined
  selectedTableId: string | null
  currentZoneName: string
  currentZoneId: string
  libraryTables: TableItem[]

  // UI State
  zoom: number
  showGrid: boolean
  resetDialogOpen: boolean
  isLoading: boolean
  hasPositionChanges: boolean
  isResetLoading: boolean

  // Actions
  setSelectedTableId: (id: string | null) => void
  setZoom: (zoom: number) => void
  setShowGrid: (show: boolean) => void
  setResetDialogOpen: (open: boolean) => void
  handleAreaChange: (area: string) => void
  handleTableUpdate: (id: string, updates: Partial<TableItem>) => void
  handleTableSave: (id: string, updates: Partial<TableItem>) => Promise<void>
  handleTableDelete: (id: string) => void
  handleTableRemove: (id: string) => Promise<void>
  handleAddTable: (tableTemplate: Omit<TableItem, 'id' | 'position' | 'area'>) => Promise<void>
  handleSave: () => Promise<void>
  handleReset: () => void
  handleResetLayout: () => Promise<void>
  handleConfirmReset: () => Promise<void>
}

export function useTableLayout({
  initialZone,
  initialTableId,
}: UseTableLayoutOptions = {}): UseTableLayoutReturn {
  // State
  const [selectedTableId, setSelectedTableId] = useState<string | null>(initialTableId ?? null)
  const [selectedZone, setSelectedZone] = useState(initialZone || '')
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [positionChanges, setPositionChanges] = useState<Map<string, TablePosition>>(new Map())
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [localTables, setLocalTables] = useState<TableItem[]>([])
  const prevZoneRef = useRef<string>('')

  // Queries
  const { data: zonesData } = useZonesQuery()
  const zones = zonesData?.data || []

  // Derive current zone
  const currentZoneObj =
    zones.find((z) => z.id === selectedZone || z.name === selectedZone) || zones[0] || null
  const currentZoneId = currentZoneObj?.id || ''
  const currentZoneName = currentZoneObj?.name || currentZoneId

  const {
    data: layoutData,
    isLoading: isLoadingLayout,
    refetch: refetchLayout,
  } = useZoneLayoutQuery(currentZoneId || null, !!currentZoneId)

  // Mutations
  const batchUpdateMutation = useBatchUpdatePositionsMutation()
  const createTableMutation = useCreateTableMutation()
  const updateTableMutation = useUpdateTableMutation()
  const { handleError, getErrorMessage } = useErrorHandler()

  // Memoized values
  const areas = useMemo(() => zones.map((z) => z.name || z.id), [zones])

  const selectedTable = useMemo(
    () => localTables.find((t) => t.id === selectedTableId),
    [localTables, selectedTableId],
  )

  const libraryTables = useMemo(() => {
    return localTables.filter((table) => {
      const pos: any = table.position
      if (!pos) return true
      return pos.x === -1 && pos.y === -1
    })
  }, [localTables])

  // Effects
  // Reset state when zone changes
  useEffect(() => {
    if (prevZoneRef.current !== currentZoneId && prevZoneRef.current !== '') {
      setLocalTables([])
      setPositionChanges(new Map())
      setSelectedTableId(null)
    }
    prevZoneRef.current = currentZoneId
  }, [currentZoneId])

  // Sync data from API
  useEffect(() => {
    if (!isLoadingLayout && layoutData?.data) {
      const tables = layoutData.data.tables || []
      const newTables = tables.map(transformTableToItem)
      setLocalTables(newTables)
    }
  }, [layoutData, isLoadingLayout])

  // Sync initial zone from URL
  useEffect(() => {
    if (initialZone && zones.length > 0) {
      const zone = zones.find((z) => z.id === initialZone || z.name === initialZone)
      if (zone) {
        setSelectedZone(zone.id)
      } else {
        setSelectedZone(initialZone)
      }
    } else if (initialZone) {
      setSelectedZone(initialZone)
    }
  }, [initialZone, zones])

  // Sync initial table from URL
  useEffect(() => {
    if (initialTableId && localTables.length > 0) {
      const table = localTables.find((t) => t.id === initialTableId)
      if (table) {
        setSelectedTableId(initialTableId)
      }
    }
  }, [initialTableId, localTables])

  // Handlers
  const handleTableUpdate = useCallback(
    (id: string, updates: Partial<TableItem>) => {
      // Track position changes
      if (updates.position) {
        setPositionChanges((prev) => {
          const newMap = new Map(prev)
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

      // Update local state
      setLocalTables((prevTables) => {
        return prevTables.map((t) => {
          if (t.id === id) {
            if (updates.position && updates.position.rotation === undefined) {
              const preservedRotation = t.position.rotation ?? t.rotation ?? 0
              updates.position = {
                ...updates.position,
                rotation: formatRotation(preservedRotation),
              }
            }

            if (updates.rotation !== undefined && updates.position === undefined) {
              updates.position = {
                ...t.position,
                rotation: formatRotation(updates.rotation),
              }
            }

            const updatedTable = { ...t, ...updates }
            if (updates.position?.rotation !== undefined) {
              updatedTable.rotation = formatRotation(updates.position.rotation)
            }

            if (updates.type !== undefined || updates.seats !== undefined) {
              updatedTable.size = calculateTableSize(updatedTable.type, updatedTable.seats)
            }

            return updatedTable
          }
          return t
        })
      })
    },
    [localTables],
  )

  const handleTableDelete = useCallback((id: string) => {
    setLocalTables((prevTables) => prevTables.filter((t) => t.id !== id))
    setSelectedTableId(null)
  }, [])

  const handleTableSave = useCallback(
    async (id: string, updates: Partial<TableItem>) => {
      try {
        const table = localTables.find((t) => t.id === id)
        if (!table) return

        const payload: any = {}

        if (updates.name !== undefined) payload.table_number = updates.name
        if (updates.seats !== undefined) payload.capacity = updates.seats
        if (updates.area !== undefined) {
          const zone = zones.find((z) => z.name === updates.area || z.id === updates.area)
          if (zone) payload.zone_id = zone.id
        }
        if (updates.status !== undefined) payload.status = mapStatusToBackend(updates.status)
        if (updates.type !== undefined) payload.shape = mapShapeToBackend(updates.type)
        if (updates.position !== undefined) {
          const rotation = updates.position.rotation ?? table.rotation ?? 0
          payload.position = {
            x: updates.position.x,
            y: updates.position.y,
            rotation: formatRotation(rotation),
          }
        }

        await updateTableMutation.mutateAsync({ id, payload })
        toast.success('Bàn đã được cập nhật thành công')
        handleTableUpdate(id, updates)
      } catch (error: any) {
        handleError(error, 'Có lỗi xảy ra khi cập nhật bàn')
      }
    },
    [localTables, zones, updateTableMutation, handleError, handleTableUpdate],
  )

  const handleTableRemove = useCallback(
    async (id: string) => {
      await handleTableSave(id, { position: { x: -1, y: -1, rotation: formatRotation(0) } })
      setSelectedTableId(null)
    },
    [handleTableSave],
  )

  const handleAddTable = useCallback(
    async (tableTemplate: Omit<TableItem, 'id' | 'position' | 'area'>) => {
      try {
        await createTableMutation.mutateAsync({
          table_number: tableTemplate.name,
          capacity: tableTemplate.seats,
          zone_id: currentZoneObj?.id || currentZoneId,
          shape: mapShapeToBackend(tableTemplate.type) as 'circle' | 'rectangle' | 'oval',
          status: 'available',
          is_active: true,
          position: { x: -1, y: -1, rotation: formatRotation(0) },
        })
        toast.success('Bàn đã được tạo thành công')
      } catch (error: any) {
        handleError(error, 'Có lỗi xảy ra khi tạo bàn')
      }
    },
    [currentZoneObj, currentZoneId, createTableMutation, handleError],
  )

  const handleSave = useCallback(async () => {
    try {
      if (positionChanges.size === 0) {
        toast.info('Không có thay đổi nào để lưu')
        return
      }

      const updates = Array.from(positionChanges.entries()).map(([tableId, position]) => {
        const table = localTables.find((t) => t.id === tableId)
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
      setPositionChanges(new Map())
    } catch (error: any) {
      handleError(error, 'Có lỗi xảy ra khi lưu sơ đồ')
    }
  }, [positionChanges, localTables, batchUpdateMutation, handleError])

  const handleReset = useCallback(() => {
    setResetDialogOpen(true)
  }, [])

  const handleResetLayout = useCallback(async () => {
    const { data } = await refetchLayout()
    const freshTables = data?.data.tables ? data.data.tables.map(transformTableToItem) : []
    setLocalTables(freshTables)
    setPositionChanges(new Map())
    setSelectedTableId(null)
  }, [layoutData, refetchLayout])

  const handleConfirmReset = useCallback(async () => {
    try {
      const updatePromises = localTables.map((table) =>
        updateTableMutation.mutateAsync({
          id: table.id,
          payload: { position: { x: -1, y: -1, rotation: formatRotation(0) } },
        } as any),
      )
      await Promise.all(updatePromises)

      toast.success('Layout đã được đặt lại thành công')

      setLocalTables((prevTables) =>
        prevTables.map((table) => ({
          ...table,
          position: { x: -1, y: -1, rotation: 0 },
        })),
      )

      setSelectedTableId(null)
      setPositionChanges(new Map())
      setResetDialogOpen(false)
    } catch (error: any) {
      handleError(error, 'Có lỗi xảy ra khi đặt lại layout')
    }
  }, [localTables, updateTableMutation, handleError])

  const handleAreaChange = useCallback(
    (area: string) => {
      const zone = zones.find((z) => z.name === area || z.id === area)
      setSelectedZone(zone?.id || area)
      setSelectedTableId(null)
      setPositionChanges(new Map())
    },
    [zones],
  )

  return {
    // Data
    tables: localTables,
    zones,
    areas,
    selectedTable,
    selectedTableId,
    currentZoneName,
    currentZoneId,
    libraryTables,

    // UI State
    zoom,
    showGrid,
    resetDialogOpen,
    isLoading: isLoadingLayout,
    hasPositionChanges: positionChanges.size > 0,
    isResetLoading: batchUpdateMutation.isPending || updateTableMutation.isPending,

    // Actions
    setSelectedTableId,
    setZoom,
    setShowGrid,
    setResetDialogOpen,
    handleAreaChange,
    handleTableUpdate,
    handleTableSave,
    handleTableDelete,
    handleTableRemove,
    handleAddTable,
    handleSave,
    handleReset,
    handleResetLayout,
    handleConfirmReset,
  }
}
