'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Search, ChevronDown, QrCode, Shield, Download, AlertTriangle } from 'lucide-react'
import type { QRStatus } from '@/types/tables'

interface QRManagerToolbarProps {
  zones: Array<{ id: string; name: string }>
  statusFilter?: QRStatus
  zoneFilter?: string
  onStatusFilterChange: (status: QRStatus | undefined) => void
  onZoneFilterChange: (zoneId: string | undefined) => void
  onGenerateAll: (forceRegenerate: boolean) => void
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
  const [searchQuery, setSearchQuery] = useState('')
  const [showForceWarning, setShowForceWarning] = useState(false)

  const statusMap: Record<QRStatus, string> = {
    ready: 'Có QR',
    missing: 'Thiếu QR',
    outdated: 'Lỗi thời',
  }

  const selectedZoneName = zoneFilter
    ? zones.find((z) => z.id === zoneFilter)?.name || 'Tất cả'
    : 'Tất cả'

  const selectedStatusLabel = statusFilter ? statusMap[statusFilter] : 'Tất cả trạng thái'

  const handleForceGenerate = () => {
    setShowForceWarning(false)
    onGenerateAll(true)
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900/80">
        {/* Search & Filters */}
        <div className="flex flex-1 flex-wrap flex-col md:justify-start gap-2 sm:flex-row sm:items-center justify-center">
          {/* Search */}
          <div className="relative sm:max-w-xs">
            <Search className="absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm theo số bàn, khu vực hoặc link QR..."
              className="h-8 rounded-lg border-slate-200 bg-slate-50 pr-4 pl-9 text-sm focus:bg-white sm:w-64 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
            />
          </div>

          {/* Zone Filter */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 gap-1 rounded-lg bg-transparent px-3">
                  <span className="text-sm">Khu vực: {selectedZoneName}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => onZoneFilterChange(undefined)}>
                  Tất cả khu vực
                </DropdownMenuItem>
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
                <Button variant="outline" className="h-8 gap-1 rounded-lg bg-transparent px-3">
                  <span className="text-sm">{selectedStatusLabel}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => onStatusFilterChange(undefined)}>
                  Tất cả trạng thái
                </DropdownMenuItem>
                {Object.entries(statusMap).map(([key, label]) => (
                  <DropdownMenuItem key={key} onClick={() => onStatusFilterChange(key as QRStatus)}>
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap md:justify-end justify-center">
          <Button
            onClick={onSecurityInfo}
            variant="outline"
            className="h-8 gap-1 rounded-lg border border-slate-200 bg-transparent px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Shield className="h-3 w-3" />
            <span className="hidden sm:inline">Lưu ý bảo mật QR</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 gap-1 rounded-lg bg-transparent px-3">
                <Download className="h-3 w-3" />
                <span className="hidden text-sm sm:inline">Tải xuống</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDownloadAll('zip')}>Tải xuống ZIP</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownloadAll('pdf')}>Tải xuống PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Generate QR Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={isLoading}
                className="h-8 gap-1 rounded-lg bg-emerald-500 px-3 hover:bg-emerald-600"
              >
                <QrCode className="h-3 w-3" />
                <span className="hidden text-sm sm:inline">Tạo QR</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onGenerateAll(false)}>
                <QrCode className="mr-2 h-4 w-4" />
                Tạo QR cho bàn thiếu
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowForceWarning(true)}
                className="text-red-600 focus:text-red-600 dark:text-red-400"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Tạo lại toàn bộ (Force)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Force Regenerate Warning Dialog */}
      <AlertDialog open={showForceWarning} onOpenChange={setShowForceWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Tạo lại toàn bộ mã QR?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Hành động này sẽ tạo lại <strong>TẤT CẢ</strong> mã QR cho toàn bộ bàn trong hệ thống.
              </p>
              <p className="text-red-500 font-medium">
                ⚠️ Các mã QR cũ đã in hoặc dán tại bàn sẽ KHÔNG còn hoạt động.
              </p>
              <p>
                Bạn sẽ cần in lại và thay thế tất cả mã QR tại nhà hàng.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleForceGenerate}
              className="bg-red-500 hover:bg-red-600"
            >
              Tạo lại toàn bộ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
