'use client'

import { cn } from '@/lib/utils'
import { useRef } from 'react'
import { RotateCw } from 'lucide-react'
import type { TableItem } from '@/app/admin/tables/layout/page'
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
  zoom: number
  showGrid: boolean
  selectedArea: string
}

const GRID_SIZE = 20

export function FloorPlanCanvas({
  tables,
  selectedTableId,
  onTableSelect,
  onTableUpdate,
  zoom,
  showGrid,
  selectedArea,
}: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

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

  const handleRotate = (tableId: string, currentRotation: number) => {
    onTableUpdate(tableId, { rotation: (currentRotation + 90) % 360 })
  }

  // Filter tables by area and exclude tables with position -1,-1 (unplaced tables)
  const filteredTables = tables.filter(
    (t) =>
      t.area === selectedArea &&
      t.position &&
      t.position.x !== -1 &&
      t.position.y !== -1,
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    // Select table when drag starts
    onTableSelect(active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
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

      // Restrict bounds
      const canvas = canvasRef.current
      if (canvas && table) {
        const canvasRect = canvas.getBoundingClientRect()
        const maxX = canvasRect.width / zoom - table.size.width
        const maxY = canvasRect.height / zoom - table.size.height

        const finalX = Math.max(0, Math.min(snappedX, maxX))
        const finalY = Math.max(0, Math.min(snappedY, maxY))

        onTableUpdate(table.id, {
          position: { x: finalX, y: finalY },
        })
      } else {
        // Fallback if canvas ref is not available
        onTableUpdate(table.id, {
          position: { x: Math.max(0, snappedX), y: Math.max(0, snappedY) },
        })
      }
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{selectedArea}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">30m x 20m</p>
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
              'relative h-[600px] w-full overflow-auto rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50',
              showGrid && 'bg-grid-pattern',
            )}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onTableSelect(null)
              }
            }}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s',
            }}
          >
            {/* Grid background */}
            {showGrid && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgb(226 232 240 / 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgb(226 232 240 / 0.3) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
            )}

            {/* Tables */}
            {filteredTables.map((table) => (
              <DraggableTable
                key={table.id}
                table={table}
                isSelected={table.id === selectedTableId}
                onSelect={() => onTableSelect(table.id)}
                onRotate={() => handleRotate(table.id, table.rotation)}
                zoom={zoom}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  )
}

function DraggableTable({
  table,
  isSelected,
  onSelect,
  onRotate,
  zoom,
}: {
  table: TableItem
  isSelected: boolean
  onSelect: () => void
  onRotate: () => void
  zoom: number
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: table.id,
  })

  const statusColors = {
    Available: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10',
    Occupied: 'border-amber-500 bg-amber-50/50 dark:bg-amber-500/10',
    'Waiting for bill': 'border-violet-500 bg-violet-50/50 dark:bg-violet-500/10',
    Disabled: 'border-slate-400 bg-slate-50/50 dark:bg-slate-500/10',
  }

  // Adjust transform for zoom: dnd-kit's transform is in screen coordinates,
  // but canvas is scaled, so we need to divide by zoom to get correct visual movement
  const dragTransform = transform
    ? `translate3d(${transform.x / zoom}px, ${transform.y / zoom}px, 0)`
    : ''
  const combinedTransform = dragTransform
    ? `${dragTransform} rotate(${table.rotation}deg)`
    : `rotate(${table.rotation}deg)`

  return (
    <div
      ref={setNodeRef}
      suppressHydrationWarning
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      style={{
        position: 'absolute',
        left: table.position.x,
        top: table.position.y,
        width: table.size.width,
        height: table.size.height,
        transform: combinedTransform,
        opacity: isDragging ? 0.5 : 1,
        transition: isDragging ? 'none' : 'opacity 0.2s',
      }}
      className={cn(
        'touch-none border-2 select-none',
        table.type === 'round' ? 'rounded-full' : 'rounded-lg',
        statusColors[table.status],
        isSelected
          ? 'z-20 cursor-move ring-2 ring-emerald-500 ring-offset-2'
          : 'z-10 cursor-grab hover:shadow-md',
      )}
      {...listeners}
      {...attributes}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        className="pointer-events-none flex h-full flex-col items-center justify-center p-2 text-center select-none"
      >
        <p className="text-xs font-semibold text-slate-900 dark:text-white">{table.name}</p>
        <p className="text-[10px] text-slate-600 dark:text-slate-400">{table.seats} chỗ ngồi</p>
      </div>

      {/* Rotate handle */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onRotate()
          }}
          onPointerDown={(e) => {
            e.stopPropagation()
          }}
          className="no-drag absolute -top-2 -right-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-emerald-500 bg-white text-emerald-600 shadow-sm hover:bg-emerald-50 dark:bg-slate-800 dark:text-emerald-400"
          style={{ transform: `rotate(-${table.rotation}deg)` }}
        >
          <RotateCw className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
