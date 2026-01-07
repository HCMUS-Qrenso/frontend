'use client'

import { useEffect, useRef, useState, memo } from 'react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Textarea } from '@/src/components/ui/textarea'
import { Circle, Square, Users } from 'lucide-react'
import type { TableItem } from '@/src/features/admin/tables/utils/layout-transforms'
import { useTranslations } from 'next-intl'

interface FloorPlanSidePanelProps {
  selectedTable: TableItem | undefined
  onTableUpdate: (id: string, updates: Partial<TableItem>) => void
  onTableSave: (id: string, updates: Partial<TableItem>) => Promise<void>
  onTableDelete: (id: string) => void
  onAddTable: (table: Omit<TableItem, 'id' | 'position' | 'area'>) => void
  areas: string[]
  libraryTables: TableItem[]
}

function FloorPlanSidePanelComponent({
  selectedTable,
  onTableUpdate,
  onTableSave,
  onTableDelete,
  onAddTable,
  areas,
  libraryTables,
}: FloorPlanSidePanelProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'library' | 'properties'>('library')
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const t = useTranslations('tables')

  // When a table is selected, switch to properties tab and focus the name input
  useEffect(() => {
    if (selectedTable) {
      setActiveTab('properties')
    }
  }, [selectedTable])

  useEffect(() => {
    if (selectedTable && activeTab === 'properties') {
      // Focus after tab becomes active
      requestAnimationFrame(() => {
        nameInputRef.current?.focus({ preventScroll: true })
      })
    }
  }, [selectedTable, activeTab])

  const handleSave = async () => {
    if (!selectedTable) return

    setIsSaving(true)
    try {
      await onTableSave(selectedTable.id, selectedTable)
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="h-full">
        <TabsList className="w-full rounded-b-none border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
          <TabsTrigger value="library" className="flex-1 rounded-lg">
            {t('libraryTab')}
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex-1 rounded-lg">
            {t('propertiesTab')}
          </TabsTrigger>
        </TabsList>

        {/* Library Tab */}
        <TabsContent value="library" className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">{t('tableItem')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {libraryTables.length > 0
                  ? t('clickToAdd')
                  : t('noTablesInLibrary')}
              </p>
            </div>

            <div className="grid gap-3">
              {libraryTables.length > 0 ? (
                libraryTables.map((table) => {
                  const Icon = table.type === 'rectangle' ? Square : Circle
                  return (
                    <button
                      key={table.id}
                      onClick={async () => {
                        // Update table position to add it to canvas via API
                        try {
                          await onTableSave(table.id, {
                            position: { x: 200, y: 200, rotation: 0 },
                          })
                        } catch (error) {
                          // Error handling is done in parent component
                        }
                      }}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-500 dark:hover:bg-emerald-500/10"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                        <Icon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {table.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <Users className="mr-1 inline h-3 w-3" />
                          {table.seats} {t('seats')}
                        </p>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t('allTablesPlaced')}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="p-6">
          {selectedTable ? (
            <div className="space-y-6">
              <div>
                <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">
                  {t('tableProperties')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('editSelectedTable')}
                </p>
              </div>

              <div className="space-y-4">
                {/* Table Name */}
                <div className="space-y-2">
                  <Label htmlFor="table-name">{t('tableNameNumber')}</Label>
                  <Input
                    id="table-name"
                    ref={nameInputRef}
                    value={selectedTable.name}
                    onChange={(e) => onTableUpdate(selectedTable.id, { name: e.target.value })}
                    placeholder={t('tableNamePlaceholder')}
                  />
                </div>

                {/* Area */}
                <div className="space-y-2">
                  <Label htmlFor="table-area">{t('areaLabel')}</Label>
                  <Select
                    value={selectedTable.area}
                    onValueChange={(value) => onTableUpdate(selectedTable.id, { area: value })}
                  >
                    <SelectTrigger id="table-area">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Shape */}
                <div className="space-y-2">
                  <Label htmlFor="table-shape">{t('shapeLabel2')}</Label>
                  <Select
                    value={selectedTable.type}
                    onValueChange={(value: 'rectangle' | 'circle' | 'oval') =>
                      onTableUpdate(selectedTable.id, { type: value })
                    }
                  >
                    <SelectTrigger id="table-shape">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rectangle">{t('shapeRectangle')}</SelectItem>
                      <SelectItem value="circle">{t('shapeCircle')}</SelectItem>
                      <SelectItem value="oval">{t('shapeOval')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                  <Label htmlFor="table-capacity">{t('capacityLabel')}</Label>
                  <Input
                    id="table-capacity"
                    type="number"
                    min="1"
                    max="20"
                    value={selectedTable.seats}
                    onChange={(e) =>
                      onTableUpdate(selectedTable.id, {
                        seats: Number.parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="table-status">{t('statusLabel2')}</Label>
                  <Select
                    value={selectedTable.status}
                    onValueChange={(value: any) =>
                      onTableUpdate(selectedTable.id, { status: value })
                    }
                  >
                    <SelectTrigger id="table-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">{t('statusAvailable2')}</SelectItem>
                      <SelectItem value="Disabled">{t('statusDisabled')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('realtimeStatusNote')}
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="table-notes">{t('notesOptional')}</Label>
                  <Textarea
                    id="table-notes"
                    value={selectedTable.notes || ''}
                    onChange={(e) => onTableUpdate(selectedTable.id, { notes: e.target.value })}
                    placeholder={t('notesPlaceholder')}
                    rows={3}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-full bg-transparent"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? t('savingBtn') : t('updateBtn')}
                </Button>
              </div>
            </div>
          ) : (
            // Empty state
            <div className="flex h-[500px] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Square className="h-8 w-8 text-slate-400" />
              </div>
              <p className="mb-2 font-medium text-slate-900 dark:text-white">{t('noTableSelected')}</p>
              <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
                {t('noTableSelectedHint')}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Custom comparison function for React.memo
const areEqual = (
  prevProps: FloorPlanSidePanelProps,
  nextProps: FloorPlanSidePanelProps,
): boolean => {
  // Compare selectedTable by reference and id
  if (prevProps.selectedTable?.id !== nextProps.selectedTable?.id) {
    return false
  }

  // Deep compare selectedTable if it exists
  if (prevProps.selectedTable && nextProps.selectedTable) {
    const prev = prevProps.selectedTable
    const next = nextProps.selectedTable
    if (
      prev.id !== next.id ||
      prev.name !== next.name ||
      prev.seats !== next.seats ||
      prev.type !== next.type ||
      prev.status !== next.status ||
      prev.area !== next.area ||
      prev.notes !== next.notes
    ) {
      return false
    }
  }

  // Compare areas array
  if (prevProps.areas.length !== nextProps.areas.length) {
    return false
  }
  for (let i = 0; i < prevProps.areas.length; i++) {
    if (prevProps.areas[i] !== nextProps.areas[i]) {
      return false
    }
  }

  // Compare libraryTables array length and IDs
  if (prevProps.libraryTables.length !== nextProps.libraryTables.length) {
    return false
  }
  for (let i = 0; i < prevProps.libraryTables.length; i++) {
    if (prevProps.libraryTables[i].id !== nextProps.libraryTables[i].id) {
      return false
    }
  }

  // Callbacks are compared by reference - they should be memoized in parent
  return true
}

export const FloorPlanSidePanel = memo(FloorPlanSidePanelComponent, areEqual)
