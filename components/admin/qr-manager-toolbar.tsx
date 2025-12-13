"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, ChevronDown, QrCode, Printer, Eye, EyeOff, Shield } from "lucide-react"

interface QRManagerToolbarProps {
  onGenerateAll: () => void
  onPrintBatch: () => void
  onSecurityInfo: () => void
}

export function QRManagerToolbar({ onGenerateAll, onPrintBatch, onSecurityInfo }: QRManagerToolbarProps) {
  const [showPreview, setShowPreview] = useState(true)
  const [selectedArea, setSelectedArea] = useState("Tất cả")
  const [selectedStatus, setSelectedStatus] = useState("Tất cả")

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:flex-row md:items-center md:justify-between">
      {/* Search & Filters */}
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo số bàn, khu vực hoặc link QR..."
            className="rounded-full border-slate-200 bg-slate-50/50 pl-9 dark:border-slate-700 dark:bg-slate-800/50"
          />
        </div>

        {/* Area Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-full bg-transparent">
              <span className="text-sm">{selectedArea}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setSelectedArea("Tất cả")}>Tất cả khu vực</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedArea("Tầng 1")}>Tầng 1</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedArea("Tầng 2")}>Tầng 2</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedArea("Khu ngoài trời")}>Khu ngoài trời</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-full bg-transparent">
              <span className="text-sm">{selectedStatus}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setSelectedStatus("Tất cả")}>Tất cả trạng thái</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus("Có QR")}>Có QR</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus("Thiếu QR")}>Thiếu QR</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus("Tạo lại gần đây")}>
              Tạo lại gần đây
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Show Preview Toggle */}
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-transparent"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onSecurityInfo}
          variant="outline"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-transparent px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Shield className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Lưu ý bảo mật QR</span>
        </Button>
        <Button onClick={onGenerateAll} className="gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600">
          <QrCode className="h-4 w-4" />
          <span className="hidden sm:inline">Tạo tất cả</span>
        </Button>
        <Button onClick={onPrintBatch} variant="outline" className="gap-2 rounded-full bg-transparent">
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">In hàng loạt</span>
        </Button>
      </div>
    </div>
  )
}
