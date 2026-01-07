'use client'

import { useSearchParams } from 'next/navigation'
import { FloorPlanCanvas } from '@/src/features/admin/tables/components/layout/floor-plan-canvas'
import { FloorPlanToolbar } from '@/src/features/admin/tables/components/layout/floor-plan-toolbar'
import { FloorPlanSidePanel } from '@/src/features/admin/tables/components/layout/floor-plan-side-panel'
import { LayoutResetDialog } from '@/src/features/admin/tables/components/layout/layout-reset-dialog'
import { useTableLayout } from '@/src/features/admin/tables/hooks/use-table-layout'

export default function TableLayoutPage() {
  const searchParams = useSearchParams()
  const zoneParam = searchParams.get('zone')
  const tableIdParam = searchParams.get('tableId')

  const {
    // Data
    tables,
    zones,
    areas,
    selectedTable,
    selectedTableId,
    currentZoneName,
    libraryTables,

    // UI State
    zoom,
    showGrid,
    resetDialogOpen,
    isLoading,
    isResetLoading,

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
  } = useTableLayout({
    initialZone: zoneParam,
    initialTableId: tableIdParam,
  })

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
        isLoading={isLoading}
      />

      {/* Main content: Canvas + Side Panel */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        {/* Canvas */}
        <FloorPlanCanvas
          tables={tables}
          selectedTableId={selectedTableId}
          onTableSelect={setSelectedTableId}
          onTableUpdate={handleTableUpdate}
          zoom={zoom}
          onZoomChange={setZoom}
          showGrid={showGrid}
          selectedArea={currentZoneName}
          onTableRemove={handleTableRemove}
          isLoading={isLoading}
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
      <LayoutResetDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        onConfirm={handleConfirmReset}
        isLoading={isResetLoading}
      />
    </div>
  )
}
