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
import { Search, Plus, ChevronDown, ArrowUpDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useZonesQuery } from '@/hooks/use-zones-query'
import { useQueryClient } from '@tanstack/react-query'
import { zonesQueryKeys } from '@/hooks/use-zones-query'

export function ZonesFilterToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  // Get filter values from URL params
  const searchQuery = searchParams.get('search') || ''
  const selectedStatusKey = searchParams.get('is_active') || 'all'
  const sortBy =
    (searchParams.get('sort_by') as 'name' | 'displayOrder' | 'createdAt' | 'updatedAt') ||
    'displayOrder'
  const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc'

  const statusMap: Record<string, string> = {
    all: 'Tất cả',
    true: 'Hoạt động',
    false: 'Tạm ẩn',
  }

  const sortByLabels: Record<string, string> = {
    name: 'Tên khu vực',
    displayOrder: 'Thứ tự',
    createdAt: 'Ngày tạo',
    updatedAt: 'Ngày cập nhật',
  }

  const sortOrderLabels: Record<string, string> = {
    asc: 'Tăng dần',
    desc: 'Giảm dần',
  }

  // Map backend status key to frontend label for display
  const selectedStatusLabel = statusMap[selectedStatusKey] || 'Tất cả'

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  // Update URL params when filters change
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.set('page', '1') // Reset to first page when filtering
    router.push(`/admin/tables/zones?${params.toString()}`)
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter('search', localSearchQuery)
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearchQuery])

  // Trigger refetch when filters change (handled automatically by React Query through query key changes)
  // This ensures the table updates when filters are applied

  const handleAddZone = () => {
    const params = new URLSearchParams(searchParams.toString())
    // Remove id param if exists (for edit mode)
    params.delete('id')
    params.set('modal', 'zone')
    params.set('mode', 'create')
    router.push(`/admin/tables/zones?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900/80">
      {/* Left - Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo tên khu vực..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="h-8 w-full rounded-lg border-slate-200 bg-slate-50 pr-4 pl-9 text-sm focus:bg-white sm:w-64 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
          />
        </div>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 gap-1 rounded-lg bg-transparent px-3">
              <span className="text-sm">Trạng thái: {selectedStatusLabel}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem onClick={() => updateFilter('is_active', 'all')}>
              Tất cả
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('is_active', 'true')}>
              Hoạt động
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('is_active', 'false')}>
              Tạm ẩn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort By */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 gap-1 rounded-lg bg-transparent px-3">
              <ArrowUpDown className="h-3 w-3" />
              <span className="text-sm">Sắp xếp: {sortByLabels[sortBy] ?? 'Thứ tự'}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => updateFilter('sort_by', 'displayOrder')}>
              Thứ tự
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilter('sort_by', 'name')}>
              Tên khu vực
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
              <span className="text-sm">{sortOrderLabels[sortOrder] ?? 'Tăng dần'}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-32">
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
      <div className="flex items-center gap-2">
        <Button
          onClick={handleAddZone}
          className="h-8 gap-1 rounded-lg bg-emerald-600 px-3 hover:bg-emerald-700"
        >
          <Plus className="h-3 w-3" />
          <span className="hidden text-sm md:inline">Thêm khu vực</span>
        </Button>
      </div>
    </div>
  )
}
