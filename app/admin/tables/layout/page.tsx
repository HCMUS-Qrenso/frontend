'use client'

import { AdminLayout } from '@/components/admin/admin-layout'
import { FloorPlanCanvas } from '@/components/admin/floor-plan-canvas'
import { FloorPlanToolbar } from '@/components/admin/floor-plan-toolbar'
import { FloorPlanSidePanel } from '@/components/admin/floor-plan-side-panel'
import { useState } from 'react'

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

// Mock data for tables from table list (should come from API/state management)
const mockAvailableTables = [
  {
    id: '1',
    number: '1',
    seats: 4,
    area: 'Tầng 1 - Khu cửa sổ',
    status: 'Occupied' as const,
    currentOrder: '#ORD-1234',
  },
  { id: '2', number: '2', seats: 2, area: 'Tầng 1 - Khu cửa sổ', status: 'Available' as const },
  {
    id: '3',
    number: '3',
    seats: 6,
    area: 'Tầng 1 - Trung tâm',
    status: 'Waiting for bill' as const,
    currentOrder: '#ORD-1235',
  },
  { id: '4', number: '4', seats: 4, area: 'Tầng 1 - Trung tâm', status: 'Available' as const },
  {
    id: '5',
    number: '5',
    seats: 4,
    area: 'Tầng 2 - VIP',
    status: 'Occupied' as const,
    currentOrder: '#ORD-1236',
  },
  { id: '6', number: '6', seats: 8, area: 'Tầng 2 - VIP', status: 'Available' as const },
  { id: '7', number: '7', seats: 2, area: 'Tầng 2 - Khu ban công', status: 'Available' as const },
  {
    id: '8',
    number: '8',
    seats: 4,
    area: 'Khu ngoài trời',
    status: 'Occupied' as const,
    currentOrder: '#ORD-1237',
  },
  { id: '9', number: '9', seats: 4, area: 'Khu ngoài trời', status: 'Needs cleaning' as const },
  {
    id: '10',
    number: '10',
    seats: 6,
    area: 'Tầng 1 - Trung tâm',
    status: 'Waiting for bill' as const,
    currentOrder: '#ORD-1238',
  },
]

export default function TableLayoutPage() {
  const [tables, setTables] = useState<TableItem[]>([
    {
      id: 't1',
      type: 'rectangle',
      name: 'Table 1',
      seats: 4,
      area: 'Tầng 1',
      status: 'Available',
      position: { x: 100, y: 100 },
      rotation: 0,
      size: { width: 120, height: 80 },
      canBeMerged: true,
    },
    {
      id: 't2',
      type: 'round',
      name: 'Table 2',
      seats: 6,
      area: 'Tầng 1',
      status: 'Occupied',
      position: { x: 300, y: 100 },
      rotation: 0,
      size: { width: 120, height: 120 },
      canBeMerged: false,
    },
    {
      id: 't3',
      type: 'rectangle',
      name: 'Table 3',
      seats: 2,
      area: 'Tầng 1',
      status: 'Waiting for bill',
      position: { x: 500, y: 100 },
      rotation: 0,
      size: { width: 80, height: 80 },
      canBeMerged: true,
    },
    {
      id: 't4',
      type: 'rectangle',
      name: 'Table 4',
      seats: 4,
      area: 'Tầng 1',
      status: 'Available',
      position: { x: 100, y: 300 },
      rotation: 0,
      size: { width: 120, height: 80 },
      canBeMerged: true,
    },
    {
      id: 't5',
      type: 'round',
      name: 'Table 5',
      seats: 8,
      area: 'Tầng 1',
      status: 'Disabled',
      position: { x: 300, y: 300 },
      rotation: 0,
      size: { width: 140, height: 140 },
      canBeMerged: false,
    },
  ])

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [selectedArea, setSelectedArea] = useState('Tầng 1')
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [history, setHistory] = useState<TableItem[][]>([tables])
  const [historyIndex, setHistoryIndex] = useState(0)

  const selectedTable = tables.find((t) => t.id === selectedTableId)

  const handleTableUpdate = (id: string, updates: Partial<TableItem>) => {
    const newTables = tables.map((t) => (t.id === id ? { ...t, ...updates } : t))
    setTables(newTables)
    addToHistory(newTables)
  }

  const handleTableDelete = (id: string) => {
    const newTables = tables.filter((t) => t.id !== id)
    setTables(newTables)
    setSelectedTableId(null)
    addToHistory(newTables)
  }

  const handleAddTable = (tableTemplate: Omit<TableItem, 'id' | 'position' | 'area'>) => {
    const newTable: TableItem = {
      ...tableTemplate,
      id: `t${Date.now()}`,
      position: { x: 200, y: 200 },
      area: selectedArea,
    }
    const newTables = [...tables, newTable]
    setTables(newTables)
    setSelectedTableId(newTable.id)
    addToHistory(newTables)
  }

  const addToHistory = (newTables: TableItem[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newTables)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setTables(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setTables(history[historyIndex + 1])
    }
  }

  const handleSave = () => {
    console.log('[v0] Saving layout:', tables)
    // TODO: Implement save to backend
    alert('Đã lưu sơ đồ!')
  }

  const handleReset = () => {
    if (confirm('Bạn có chắc muốn reset layout về mặc định?')) {
      setTables([])
      setSelectedTableId(null)
      addToHistory([])
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Toolbar */}
        <FloorPlanToolbar
          selectedArea={selectedArea}
          onAreaChange={setSelectedArea}
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
            onTableUpdate={handleTableUpdate}
            zoom={zoom}
            showGrid={showGrid}
            selectedArea={selectedArea}
          />

          {/* Side Panel */}
          <FloorPlanSidePanel
            selectedTable={selectedTable}
            onTableUpdate={handleTableUpdate}
            onTableDelete={handleTableDelete}
            onAddTable={handleAddTable}
            areas={['Tầng 1', 'Tầng 2', 'Sân vườn']}
            availableTables={mockAvailableTables}
            tablesInLayout={tables}
          />
        </div>
      </div>
    </AdminLayout>
  )
}
