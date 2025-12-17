'use client'

import { cn } from '@/lib/utils'
import { formatRotation } from '@/lib/utils/table-utils'
import { useRef, useState, useEffect, useMemo, useCallback, memo } from 'react'
import { RotateCw } from 'lucide-react'
import type { TableItem } from '@/app/admin/tables/layout/page'
import type React from 'react'
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'

interface FloorPlanCanvasProps {
  tables: TableItem[]
  selectedTableId: string | null
  onTableSelect: (id: string | null) => void
  onTableUpdate: (id: string, updates: Partial<TableItem>) => void
  onTableRemove: (id: string) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  showGrid: boolean
  selectedArea: string
}

const GRID_SIZE = 20

/**
 * Snap rotation to nearest cardinal direction (0, 90, 180, 270) within tolerance
 */
function snapToCardinalDirection(angle: number, tolerance: number = 3): number {
  const normalizedAngle = ((angle % 360) + 360) % 360
  const cardinalDirections = [0, 90, 180, 270]

  for (const cardinal of cardinalDirections) {
    const diff = Math.abs(normalizedAngle - cardinal)
    const minDiff = Math.min(diff, 360 - diff) // Handle wrap-around

    if (minDiff <= tolerance) {
      return cardinal
    }
  }

  return normalizedAngle
}

/**
 * Calculate rotation angle from mouse position relative to table center
 * Returns angle in degrees (0-360), where 0° = top
 */
function calculateRotationFromMouse(
  mouseX: number,
  mouseY: number,
  centerX: number,
  centerY: number,
): number {
  const dx = mouseX - centerX
  const dy = mouseY - centerY
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
  // Adjust for CSS rotation (0° = top, positive = clockwise)
  const cssAngle = angle + 90
  // Normalize to 0-360
  return ((cssAngle % 360) + 360) % 360
}

function FloorPlanCanvasComponent({
  tables,
  selectedTableId,
  onTableSelect,
  onTableUpdate,
  onTableRemove,
  zoom,
  onZoomChange,
  showGrid,
  selectedArea,
}: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  // Update canvas size when container resizes
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setCanvasSize({ width: rect.width, height: rect.height })
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  // Setup sensors with activation constraint to avoid conflict with click
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag
      },
      // Ignore drag when clicking on rotate button
      ignoreFrom: '.no-drag',
    }),
  )

  // Pan handlers - only pan when clicking on empty canvas
  const handlePanStart = useCallback(
    (e: React.PointerEvent) => {
      // Only pan if clicking directly on the canvas background, not on draggable elements
      if (e.target === e.currentTarget && (e.button === 1 || e.button === 0)) {
        e.preventDefault()
        setIsPanning(true)
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
      }
    },
    [panOffset],
  )

  const handlePanMove = useCallback(
    (e: PointerEvent) => {
      if (!isPanning) return
      e.preventDefault()
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    },
    [isPanning, panStart],
  )

  const handlePanEnd = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Zoom handler with zoom-to-cursor functionality
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const delta = e.deltaY > 0 ? -0.1 : 0.1
      const newZoom = Math.max(0.1, Math.min(3, zoom + delta))

      // Zoom towards mouse cursor
      const zoomFactor = newZoom / zoom
      const newPanX = mouseX - (mouseX - panOffset.x) * zoomFactor
      const newPanY = mouseY - (mouseY - panOffset.y) * zoomFactor

      setPanOffset({ x: newPanX, y: newPanY })
      onZoomChange(newZoom)
    },
    [zoom, panOffset, onZoomChange],
  )

  // Set up global pan handlers
  useEffect(() => {
    if (!isPanning) return

    window.addEventListener('pointermove', handlePanMove)
    window.addEventListener('pointerup', handlePanEnd)
    window.addEventListener('pointercancel', handlePanEnd)

    return () => {
      window.removeEventListener('pointermove', handlePanMove)
      window.removeEventListener('pointerup', handlePanEnd)
      window.removeEventListener('pointercancel', handlePanEnd)
    }
  }, [isPanning, handlePanMove, handlePanEnd])

  // Memoize filtered tables to avoid recalculating on every render
  const filteredTables = useMemo(
    () =>
      tables.filter(
        (t) => t.area === selectedArea && t.position && t.position.x !== -1 && t.position.y !== -1,
      ),
    [tables, selectedArea],
  )

  // Memoize rotate update handler
  const handleRotateUpdate = useCallback(
    (tableId: string, newRotation: number, applySnap: boolean = false) => {
      const table = tables.find((t) => t.id === tableId)
      if (!table) return

      const finalRotation = applySnap ? snapToCardinalDirection(newRotation) : newRotation
      const formattedRotation = formatRotation(finalRotation)

      // Update both rotation field and position.rotation to keep them in sync
      onTableUpdate(tableId, {
        rotation: formattedRotation,
        position: {
          ...table.position,
          rotation: formattedRotation,
        },
      })
    },
    [tables, onTableUpdate],
  )

  // Memoize drag start handler
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      // Select table when drag starts
      onTableSelect(active.id as string)
    },
    [onTableSelect],
  )

  // Memoize drag end handler
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event
      const table = tables.find((t) => t.id === active.id)

      // Only process tables with valid positions (not -1,-1)
      if (table && delta && table.position && table.position.x !== -1 && table.position.y !== -1) {
        // Calculate new position with zoom adjustment
        const dx = delta.x / zoom
        const dy = delta.y / zoom

        const newX = table.position.x + dx
        const newY = table.position.y + dy

        // Snap to grid
        const snappedX = Math.round(newX / GRID_SIZE) * GRID_SIZE
        const snappedY = Math.round(newY / GRID_SIZE) * GRID_SIZE

        // Allow unlimited placement - no bounds restrictions
        onTableUpdate(table.id, {
          position: {
            x: snappedX,
            y: snappedY,
            rotation: table.position.rotation ?? table.rotation ?? 0,
          },
        })
      }
    },
    [tables, zoom, onTableUpdate],
  )

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{selectedArea}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Canvas không giới hạn - Kéo thả để di chuyển
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border-2 border-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400">Có sẵn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border-2 border-amber-500" />
              <span className="text-slate-600 dark:text-slate-400">Đang sử dụng</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border-2 border-violet-500" />
              <span className="text-slate-600 dark:text-slate-400">Chờ thanh toán</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border-2 border-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">Vô hiệu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative overflow-hidden p-6" style={{ minHeight: '600px' }}>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div
            ref={canvasRef}
            className={cn(
              'relative overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50',
              isPanning ? 'cursor-grabbing' : 'cursor-grab',
            )}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onTableSelect(null)
              }
            }}
            onPointerDown={handlePanStart}
            onWheel={handleWheel}
            style={{
              width: '100%',
              height: '600px',
              cursor: isPanning ? 'grabbing' : 'grab',
              // Grid background on the canvas itself, adjusted for pan and zoom
              backgroundImage: showGrid
                ? 'linear-gradient(to right, rgb(226 232 240 / 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgb(226 232 240 / 0.3) 1px, transparent 1px)'
                : undefined,
              backgroundSize: showGrid ? `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px` : undefined,
              backgroundPosition: showGrid ? `${panOffset.x}px ${panOffset.y}px` : undefined,
            }}
          >
            {/* Content layer - transformed for pan and zoom */}
            <div
              className="relative"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                // Disable transition during drag to prevent lag
                transition: 'none',
              }}
            >
              {/* Tables */}
              {filteredTables.map((table) => (
                <DraggableTable
                  key={table.id}
                  table={table}
                  isSelected={table.id === selectedTableId}
                  onSelect={onTableSelect}
                  onRotateUpdate={handleRotateUpdate}
                  onRemove={onTableRemove}
                  zoom={zoom}
                />
              ))}
            </div>
          </div>
        </DndContext>
      </div>
    </div>
  )
}

const DraggableTable = memo(function DraggableTable({
  table,
  isSelected,
  onSelect,
  onRotateUpdate,
  onRemove,
  zoom,
}: {
  table: TableItem
  isSelected: boolean
  onSelect: (id: string | null) => void
  onRotateUpdate: (tableId: string, newRotation: number, applySnap: boolean) => void
  onRemove: (id: string) => void
  zoom: number
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: table.id,
  })

  const [isRotating, setIsRotating] = useState(false)
  const [tempRotation, setTempRotation] = useState<number | null>(null)
  const rotationStartRef = useRef<{
    initialAngle: number
    initialRotation: number
    centerX: number
    centerY: number
  } | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  // Memoize status colors to avoid recreating object on every render
  const statusColors = useMemo(
    () => ({
      Available: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10',
      Occupied: 'border-amber-500 bg-amber-50/50 dark:bg-amber-500/10',
      'Waiting for bill': 'border-violet-500 bg-violet-50/50 dark:bg-violet-500/10',
      Disabled: 'border-slate-400 bg-slate-50/50 dark:bg-slate-500/10',
    }),
    [],
  )

  // Adjust transform for zoom: dnd-kit's transform is in screen coordinates,
  // but canvas is scaled, so we need to divide by zoom to get correct visual movement
  const baseRotation = table.position?.rotation ?? table.rotation ?? 0
  const rotation = tempRotation !== null ? tempRotation : baseRotation

  // Memoize transform calculations to avoid string concatenation on every render
  const combinedTransform = useMemo(() => {
    const dragTransform = transform
      ? `translate3d(${transform.x / zoom}px, ${transform.y / zoom}px, 0)`
      : ''
    return dragTransform ? `${dragTransform} rotate(${rotation}deg)` : `rotate(${rotation}deg)`
  }, [transform, rotation, zoom])

  // Memoize wrapper callbacks to avoid recreating on every render
  const handleSelect = useCallback(() => {
    onSelect(table.id)
  }, [onSelect, table.id])

  const handleRemove = useCallback(() => {
    onRemove(table.id)
  }, [onRemove, table.id])

  const handleRotateUpdateWrapper = useCallback(
    (newRotation: number, applySnap: boolean) => {
      onRotateUpdate(table.id, newRotation, applySnap)
    },
    [onRotateUpdate, table.id],
  )

  // Memoize rotate handlers to avoid recreating on every render
  const handleRotateStart = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      e.preventDefault()

      if (!tableRef.current) return

      setIsRotating(true)
      const rect = tableRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const currentRotation = baseRotation
      const initialAngle = calculateRotationFromMouse(e.clientX, e.clientY, centerX, centerY)

      rotationStartRef.current = {
        initialAngle,
        initialRotation: currentRotation,
        centerX,
        centerY,
      }
    },
    [baseRotation],
  )

  const handleRotateMove = useCallback((e: PointerEvent) => {
    if (!rotationStartRef.current || !tableRef.current) return

    e.preventDefault()

    const { initialAngle, initialRotation, centerX, centerY } = rotationStartRef.current

    // Calculate current angle
    const currentAngle = calculateRotationFromMouse(e.clientX, e.clientY, centerX, centerY)

    // Calculate rotation delta
    let deltaAngle = currentAngle - initialAngle

    // Handle wrap-around (e.g., going from 350° to 10°)
    if (deltaAngle > 180) {
      deltaAngle -= 360
    } else if (deltaAngle < -180) {
      deltaAngle += 360
    }

    // Apply rotation delta to initial rotation
    const newRotation = (((initialRotation + deltaAngle) % 360) + 360) % 360

    // Update temporary rotation for visual feedback (no snap during drag)
    setTempRotation(newRotation)
  }, [])

  const handleRotateEnd = useCallback(() => {
    if (tempRotation !== null) {
      // Apply snap when drag ends
      handleRotateUpdateWrapper(tempRotation, true)
    }
    setIsRotating(false)
    setTempRotation(null)
    rotationStartRef.current = null
  }, [tempRotation, handleRotateUpdateWrapper])

  // Set up global pointer move/up handlers when rotating
  useEffect(() => {
    if (!isRotating) return

    window.addEventListener('pointermove', handleRotateMove, { passive: false })
    window.addEventListener('pointerup', handleRotateEnd)
    window.addEventListener('pointercancel', handleRotateEnd)

    return () => {
      window.removeEventListener('pointermove', handleRotateMove)
      window.removeEventListener('pointerup', handleRotateEnd)
      window.removeEventListener('pointercancel', handleRotateEnd)
    }
  }, [isRotating, handleRotateMove, handleRotateEnd])

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        tableRef.current = node
      }}
      suppressHydrationWarning
      onClick={(e) => {
        e.stopPropagation()
        handleSelect()
      }}
      style={{
        position: 'absolute',
        left: table.position.x,
        top: table.position.y,
        width: table.size.width,
        height: table.size.height,
        transform: combinedTransform,
        opacity: isDragging ? 0.5 : 1,
        // Disable transition during drag/rotate to prevent lag
        transition: isDragging || isRotating ? 'none' : 'opacity 0.2s',
      }}
      className={cn(
        'touch-none border-2 select-none',
        table.type === 'circle' || table.type === 'oval' ? 'rounded-full' : 'rounded-lg',
        statusColors[table.status],
        isSelected
          ? 'z-20 cursor-move ring-2 ring-emerald-500 ring-offset-2'
          : 'z-10 cursor-grab hover:shadow-md',
        isRotating && 'cursor-grabbing',
      )}
      {...(isRotating ? {} : { ...listeners, ...attributes })}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
          handleSelect()
        }}
        className="pointer-events-none flex h-full flex-col items-center justify-center p-2 text-center select-none"
      >
        <p className="text-xs font-semibold text-slate-900 dark:text-white">{table.name}</p>
        <p className="text-[10px] text-slate-600 dark:text-slate-400">{table.seats} chỗ ngồi</p>
      </div>

      {/* Remove handle */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            handleRemove()
          }}
          onPointerDown={(e) => {
            e.stopPropagation()
          }}
          className="no-drag absolute -top-2 -left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-red-500 bg-white text-red-600 shadow-sm hover:bg-red-50 dark:bg-slate-800 dark:text-red-400"
        >
          ×
        </button>
      )}

      {/* Rotate handle */}
      {isSelected && (
        <button
          onPointerDown={handleRotateStart}
          className="no-drag absolute -top-2 -right-2 z-10 flex h-6 w-6 cursor-grab items-center justify-center rounded-full border border-emerald-500 bg-white text-emerald-600 shadow-sm hover:bg-emerald-50 active:cursor-grabbing dark:bg-slate-800 dark:text-emerald-400"
          style={{
            transform: `rotate(-${rotation}deg)`,
            transition: isRotating ? 'none' : 'transform 0.1s',
          }}
          title="Kéo để xoay tự do"
        >
          <RotateCw className="h-3 w-3" />
        </button>
      )}
    </div>
  )
})

// Custom comparison function for React.memo
const areEqual = (prevProps: FloorPlanCanvasProps, nextProps: FloorPlanCanvasProps): boolean => {
  // Compare primitive props
  if (
    prevProps.selectedTableId !== nextProps.selectedTableId ||
    prevProps.zoom !== nextProps.zoom ||
    prevProps.showGrid !== nextProps.showGrid ||
    prevProps.selectedArea !== nextProps.selectedArea
  ) {
    return false
  }

  // Compare tables array length
  if (prevProps.tables.length !== nextProps.tables.length) {
    return false
  }

  // Deep compare tables - only check relevant properties that affect rendering
  for (let i = 0; i < prevProps.tables.length; i++) {
    const prevTable = prevProps.tables[i]
    const nextTable = nextProps.tables[i]

    if (
      prevTable.id !== nextTable.id ||
      prevTable.position.x !== nextTable.position.x ||
      prevTable.position.y !== nextTable.position.y ||
      prevTable.position.rotation !== nextTable.position.rotation ||
      prevTable.status !== nextTable.status ||
      prevTable.name !== nextTable.name ||
      prevTable.seats !== nextTable.seats ||
      prevTable.type !== nextTable.type ||
      prevTable.area !== nextTable.area
    ) {
      return false
    }
  }

  // Callbacks are compared by reference - they should be memoized in parent
  return true
}

export const FloorPlanCanvas = memo(FloorPlanCanvasComponent, areEqual)
