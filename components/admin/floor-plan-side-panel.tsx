"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Circle, Trash2, Square, Users } from "lucide-react"
import type { TableItem } from "@/app/admin/tables/layout/page"

interface FloorPlanSidePanelProps {
  selectedTable: TableItem | undefined
  onTableUpdate: (id: string, updates: Partial<TableItem>) => void
  onTableDelete: (id: string) => void
  onAddTable: (table: Omit<TableItem, "id" | "position" | "area">) => void
  areas: string[]
}

const tableTemplates = [
  {
    type: "rectangle" as const,
    name: "Rectangle 2 seats",
    seats: 2,
    size: { width: 80, height: 80 },
    icon: Square,
  },
  {
    type: "rectangle" as const,
    name: "Rectangle 4 seats",
    seats: 4,
    size: { width: 120, height: 80 },
    icon: Square,
  },
  {
    type: "rectangle" as const,
    name: "Rectangle 6 seats",
    seats: 6,
    size: { width: 140, height: 80 },
    icon: Square,
  },
  {
    type: "round" as const,
    name: "Round 4 seats",
    seats: 4,
    size: { width: 100, height: 100 },
    icon: Circle,
  },
  {
    type: "round" as const,
    name: "Round 6 seats",
    seats: 6,
    size: { width: 120, height: 120 },
    icon: Circle,
  },
  {
    type: "round" as const,
    name: "Round 8 seats",
    seats: 8,
    size: { width: 140, height: 140 },
    icon: Circle,
  },
]

export function FloorPlanSidePanel({
  selectedTable,
  onTableUpdate,
  onTableDelete,
  onAddTable,
  areas,
}: FloorPlanSidePanelProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <Tabs defaultValue="library" className="h-full">
        <TabsList className="w-full rounded-b-none border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
          <TabsTrigger value="library" className="flex-1">
            Library
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex-1">
            Properties
          </TabsTrigger>
        </TabsList>

        {/* Library Tab */}
        <TabsContent value="library" className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">Table Items</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Click để thêm bàn mới vào trung tâm canvas</p>
            </div>

            <div className="grid gap-3">
              {tableTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() =>
                    onAddTable({
                      type: template.type,
                      name: `Table ${Date.now()}`,
                      seats: template.seats,
                      status: "Available",
                      rotation: 0,
                      size: template.size,
                      canBeMerged: true,
                    })
                  }
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-500 dark:hover:bg-emerald-500/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                    <template.icon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{template.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <Users className="mr-1 inline h-3 w-3" />
                      {template.seats} seats
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="p-6">
          {selectedTable ? (
            <div className="space-y-6">
              <div>
                <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">Table Properties</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Chỉnh sửa thuộc tính bàn đã chọn</p>
              </div>

              <div className="space-y-4">
                {/* Table Name */}
                <div className="space-y-2">
                  <Label htmlFor="table-name">Table Name / Number</Label>
                  <Input
                    id="table-name"
                    value={selectedTable.name}
                    onChange={(e) => onTableUpdate(selectedTable.id, { name: e.target.value })}
                    placeholder="e.g., Table 5"
                  />
                </div>

                {/* Area */}
                <div className="space-y-2">
                  <Label htmlFor="table-area">Area / Zone</Label>
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

                {/* Capacity */}
                <div className="space-y-2">
                  <Label htmlFor="table-capacity">Capacity</Label>
                  <Input
                    id="table-capacity"
                    type="number"
                    min="1"
                    max="20"
                    value={selectedTable.seats}
                    onChange={(e) => onTableUpdate(selectedTable.id, { seats: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="table-status">Status</Label>
                  <Select
                    value={selectedTable.status}
                    onValueChange={(value: any) => onTableUpdate(selectedTable.id, { status: value })}
                  >
                    <SelectTrigger id="table-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time status (Occupied, Waiting) được cập nhật tự động
                  </p>
                </div>

                {/* Can be merged */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can-merge"
                    checked={selectedTable.canBeMerged}
                    onCheckedChange={(checked) => onTableUpdate(selectedTable.id, { canBeMerged: checked as boolean })}
                  />
                  <Label htmlFor="can-merge" className="text-sm font-normal">
                    Can be merged with other tables
                  </Label>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="table-notes">Notes (Optional)</Label>
                  <Textarea
                    id="table-notes"
                    value={selectedTable.notes || ""}
                    onChange={(e) => onTableUpdate(selectedTable.id, { notes: e.target.value })}
                    placeholder="Add any notes about this table..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button variant="outline" size="sm" className="flex-1 rounded-full bg-transparent">
                  Update
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-full"
                  onClick={() => onTableDelete(selectedTable.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            // Empty state
            <div className="flex h-[500px] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Square className="h-8 w-8 text-slate-400" />
              </div>
              <p className="mb-2 font-medium text-slate-900 dark:text-white">No table selected</p>
              <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
                Chọn một bàn trên sơ đồ để chỉnh sửa thuộc tính hoặc kéo một bàn mới từ tab "Library"
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
