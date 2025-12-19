'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Grid3x3, Minus, Plus, RotateCcw, Save, Undo2, Redo2 } from 'lucide-react'

interface FloorPlanToolbarProps {
  selectedArea: string
  areas: string[]
  onAreaChange: (area: string) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  showGrid: boolean
  onShowGridChange: (show: boolean) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  onReset: () => void
}

export function FloorPlanToolbar({
  selectedArea,
  areas,
  onAreaChange,
  zoom,
  onZoomChange,
  showGrid,
  onShowGridChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onReset,
}: FloorPlanToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 justify-between rounded-2xl border border-slate-100 bg-white/80 px-6 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      {/* Left: Title & Area selector */}
      <div className="flex md:flex-row flex-col items-center gap-4 justify-center">
        <div className="min-w-25">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white md:text-left text-center">Sơ đồ bàn</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Sơ đồ mặt bằng & bố trí bàn</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-full bg-transparent">
              {selectedArea}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {areas.map((area) => (
              <DropdownMenuItem key={area} onClick={() => onAreaChange(area)}>
                {area}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-wrap md:justify-end justify-center">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-full">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            disabled={!canUndo}
            onClick={onUndo}
            title="Hoàn tác"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            disabled={!canRedo}
            onClick={onRedo}
            title="Làm lại"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Zoom controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-full">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            disabled={zoom <= 0.5}
            onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-[60px] text-center text-sm font-medium text-slate-700 dark:text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            disabled={zoom >= 2}
            onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
          >
            <Plus className="h-4 w-4" />
          </Button>

          {/* Grid toggle */}
          <Button
            variant={showGrid ? 'default' : 'ghost'}
            size="icon"
            className="rounded-full"
            onClick={() => onShowGridChange(!showGrid)}
            title="Bật/tắt lưới"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Reset & Save */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-full">
          <Button variant="ghost" size="sm" className="rounded-full text-red-600" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Đặt lại
          </Button>
          <Button size="sm" className="rounded-full" onClick={onSave}>
            <Save className="h-4 w-4" />
            Lưu
          </Button>
        </div>
      </div>
    </div>
  )
}
