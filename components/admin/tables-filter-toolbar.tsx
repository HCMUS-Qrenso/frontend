'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Plus, LayoutGrid, QrCode, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFloorsQuery } from '@/hooks/use-tables-query'

interface TablesFilterToolbarProps {
  isTrashView?: boolean
}

export function TablesFilterToolbar({ isTrashView = false }: TablesFilterToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: floorsData } = useFloorsQuery()
  const floors = floorsData?.data?.floors || []

  // Map backend status to UI labels
  const statusMap: Record<string, string> = {
    available: 'Trống',
    occupied: 'Đang sử dụng',
    waiting_for_payment: 'Chờ thanh toán',
    maintenance: 'Bảo trì',
  }

  // Get filter values from URL params
  const searchQuery = searchParams.get('search') || ''
  const selectedArea = searchParams.get('floor') || 'Tất cả'
  const selectedStatusKey = searchParams.get('status') || ''

  // Map backend status key to frontend label for display
  const selectedStatusLabel = selectedStatusKey
    ? statusMap[selectedStatusKey] || selectedStatusKey
    : 'Tất cả'

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  // Update URL params when filters change
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'Tất cả' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.set('page', '1') // Reset to first page when filtering
    router.push(`/admin/tables/list?${params.toString()}`)
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter('search', localSearchQuery)
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearchQuery])

  const handleAddTable = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'table')
    params.set('mode', 'create')
    router.push(`/admin/tables/list?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900/80">
      {/* Left - Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo số bàn, tên khu vực..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="h-10 w-full rounded-full border-slate-200 bg-slate-50 pr-4 pl-9 text-sm focus:bg-white sm:w-64 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
          />
        </div>

        {/* Area Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 gap-2 rounded-full bg-transparent">
              <span className="text-sm">Khu vực: {selectedArea}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => updateFilter('floor', 'Tất cả')}>
              Tất cả
            </DropdownMenuItem>
            {floors.map((floor) => (
              <DropdownMenuItem key={floor} onClick={() => updateFilter('floor', floor)}>
                {floor}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 gap-2 rounded-full bg-transparent">
              <span className="text-sm">Trạng thái: {selectedStatusLabel}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => updateFilter('status', 'Tất cả')}>
              Tất cả
            </DropdownMenuItem>
            {Object.entries(statusMap).map(([key, label]) => (
              <DropdownMenuItem key={key} onClick={() => updateFilter('status', key)}>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {!isTrashView && (
          <>
            <Link href="/admin/tables/layout">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full bg-transparent"
                title="Xem sơ đồ"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/tables/qr">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full bg-transparent"
                title="Quản lý QR"
              >
                <QrCode className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              onClick={handleAddTable}
              className="h-10 gap-2 rounded-full bg-emerald-600 px-4 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Thêm bàn</span>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
