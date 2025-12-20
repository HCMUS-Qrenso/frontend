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
import { Search, Plus, LayoutGrid, QrCode, ChevronDown, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { AdminFilterToolbarWrapper } from './admin-filter-toolbar-wrapper'
import { useRouter, useSearchParams } from 'next/navigation'
import { useZonesSimpleQuery } from '@/hooks/use-zones-query'
import type { SimpleZone } from '@/types/zones'

interface TablesFilterToolbarProps {
  isTrashView?: boolean
}

export function TablesFilterToolbar({ isTrashView = false }: TablesFilterToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: zonesData } = useZonesSimpleQuery()
  const zones: SimpleZone[] =
    zonesData?.zones ?? ((zonesData as { zones?: SimpleZone[] } | undefined)?.zones || [])

  // Map backend status to UI labels
  const statusMap: Record<string, string> = {
    available: 'Trống',
    occupied: 'Đang sử dụng',
    waiting_for_payment: 'Chờ thanh toán',
    maintenance: 'Bảo trì',
  }

  // Get filter values from URL params
  const searchQuery = searchParams.get('search') || ''
  const selectedZoneId = searchParams.get('zone_id') || 'Tất cả'
  const selectedStatusKey = searchParams.get('status') || ''
  const sortBy =
    (searchParams.get('sort_by') as 'tableNumber' | 'status' | 'createdAt' | 'updatedAt') ||
    'tableNumber'
  const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc'

  const sortByLabels: Record<string, string> = {
    tableNumber: 'Số bàn',
    status: 'Trạng thái',
    createdAt: 'Ngày tạo',
    updatedAt: 'Ngày cập nhật',
  }

  const sortOrderLabels: Record<string, string> = {
    asc: 'Tăng dần',
    desc: 'Giảm dần',
  }

  // Map backend status key to frontend label for display
  const selectedStatusLabel = selectedStatusKey
    ? statusMap[selectedStatusKey] || selectedStatusKey
    : 'Tất cả'

  // Get selected zone name for display
  const selectedZoneName =
    selectedZoneId === 'Tất cả'
      ? 'Tất cả'
      : zones.find((z: SimpleZone) => z.id === selectedZoneId)?.name || 'Tất cả'

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
    // Remove id param if exists (for edit mode)
    params.delete('id')
    params.set('modal', 'table')
    params.set('mode', 'create')
    router.push(`/admin/tables/list?${params.toString()}`)
  }

  return (
    <AdminFilterToolbarWrapper>
      {/* Left - Filters */}
      <div className="flex flex-col justify-center gap-2 sm:flex-row sm:flex-wrap sm:items-center md:justify-start">
        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo số bàn, tên khu vực..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="h-8 w-full rounded-lg border-slate-200 bg-slate-50 pr-4 pl-9 text-sm focus:bg-white sm:w-64 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
          />
        </div>

        {/* Zone Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 gap-1 rounded-lg bg-transparent px-3">
              <span className="text-sm">Khu vực: {selectedZoneName}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => updateFilter('zone_id', 'Tất cả')}>
              Tất cả
            </DropdownMenuItem>
            {zones.map((zone: SimpleZone) => (
              <DropdownMenuItem key={zone.id} onClick={() => updateFilter('zone_id', zone.id)}>
                {zone.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 gap-1 rounded-lg bg-transparent px-3">
              <span className="text-sm">Trạng thái: {selectedStatusLabel}</span>
              <ChevronDown className="h-3 w-3" />
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

        {/* Sort By */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 gap-1 rounded-lg bg-transparent px-3">
              <ArrowUpDown className="h-3 w-3" />
              <span className="text-sm">Sắp xếp: {sortByLabels[sortBy] ?? 'Số bàn'}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => updateFilter('sort_by', 'tableNumber')}>
              Số bàn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('sort_by', 'status')}>
              Trạng thái
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('sort_by', 'createdAt')}>
              Ngày tạo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('sort_by', 'updatedAt')}>
              Ngày cập nhật
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Order */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 gap-1 rounded-lg bg-transparent px-3">
              <span className="text-sm">{sortOrderLabels[sortOrder] ?? 'Tăng'}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem onClick={() => updateFilter('sort_order', 'asc')}>
              Tăng dần
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('sort_order', 'desc')}>
              Giảm dần
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center justify-center gap-2 md:justify-start">
        {!isTrashView && (
          <>
            <Link href="/admin/tables/layout">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg bg-transparent"
                title="Xem sơ đồ"
              >
                <LayoutGrid className="h-3 w-3" />
              </Button>
            </Link>
            <Link href="/admin/tables/qr">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg bg-transparent"
                title="Quản lý QR"
              >
                <QrCode className="h-3 w-3" />
              </Button>
            </Link>
            <Button
              onClick={handleAddTable}
              className="h-8 gap-1 rounded-lg bg-emerald-600 px-3 hover:bg-emerald-700"
            >
              <Plus className="h-3 w-3" />
              <span className="hidden text-sm md:inline">Thêm bàn</span>
            </Button>
          </>
        )}
      </div>
    </AdminFilterToolbarWrapper>
  )
}
