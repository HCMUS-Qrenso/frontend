"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, ChevronDown, QrCode, Eye, EyeOff, Shield, Download } from "lucide-react"
import type { QRStatus } from "@/types/tables"

interface QRManagerToolbarProps {
  zones: Array<{ id: string; name: string }>
  statusFilter?: QRStatus
  zoneFilter?: string
  onStatusFilterChange: (status: QRStatus | undefined) => void
  onZoneFilterChange: (zoneId: string | undefined) => void
  onGenerateAll: () => void
  onDownloadAll: (format: 'png' | 'pdf' | 'zip') => void
  onSecurityInfo: () => void
  isLoading?: boolean
}

export function QRManagerToolbar({
  zones,
  statusFilter,
  zoneFilter,
  onStatusFilterChange,
  onZoneFilterChange,
  onGenerateAll,
  onDownloadAll,
  onSecurityInfo,
  isLoading = false,
}: QRManagerToolbarProps) {
  const [showPreview, setShowPreview] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const statusMap: Record<QRStatus, string> = {
    ready: 'Có QR',
    missing: 'Thiếu QR',
    outdated: 'Lỗi thời',
  }

  const selectedZoneName = zoneFilter
    ? zones.find((z) => z.id === zoneFilter)?.name || 'Tất cả'
    : 'Tất cả'

  const selectedStatusLabel = statusFilter ? statusMap[statusFilter] : 'Tất cả trạng thái'

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

        {/* Zone Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-full bg-transparent">
              <span className="text-sm">Khu vực: {selectedZoneName}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onZoneFilterChange(undefined)}>Tất cả khu vực</DropdownMenuItem>
            {zones.map((zone) => (
              <DropdownMenuItem key={zone.id} onClick={() => onZoneFilterChange(zone.id)}>
                {zone.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-full bg-transparent">
              <span className="text-sm">{selectedStatusLabel}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onStatusFilterChange(undefined)}>Tất cả trạng thái</DropdownMenuItem>
            {Object.entries(statusMap).map(([key, label]) => (
              <DropdownMenuItem key={key} onClick={() => onStatusFilterChange(key as QRStatus)}>
                {label}
              </DropdownMenuItem>
            ))}
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-full bg-transparent">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Tải xuống</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDownloadAll('zip')}>Tải xuống ZIP</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownloadAll('pdf')}>Tải xuống PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownloadAll('png')}>Tải xuống PNG</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          onClick={onGenerateAll}
          disabled={isLoading}
          className="gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600"
        >
          <QrCode className="h-4 w-4" />
          <span className="hidden sm:inline">Tạo tất cả</span>
        </Button>
      </div>
    </div>
  )
}
