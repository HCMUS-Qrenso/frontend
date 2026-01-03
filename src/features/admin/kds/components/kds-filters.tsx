'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import type { OrderItemStatus } from '../types/kds.types'
import { ITEM_STATUS_CONFIG } from '../types/kds.types'

interface KdsFiltersProps {
  groupByStatus: boolean
  setGroupByStatus: (enabled: boolean) => void
  selectedStatus: OrderItemStatus | 'all'
  setSelectedStatus: (status: OrderItemStatus | 'all') => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

// Statuses to show in filter (active processing only)
const FILTER_STATUSES: (OrderItemStatus | 'all')[] = ['all', 'pending', 'accepted', 'preparing', 'ready']

export function KdsFilters({
  groupByStatus,
  setGroupByStatus,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
}: KdsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      {/* Group by Status Toggle */}
      <Button
        variant={groupByStatus ? 'default' : 'outline'}
        size="sm"
        className={groupByStatus ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        onClick={() => setGroupByStatus(!groupByStatus)}
      >
        Nhóm theo trạng thái
      </Button>

      {/* Status Chips */}
      {groupByStatus && (
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_STATUSES.map((status) => {
            const isAll = status === 'all'
            const config = isAll ? null : ITEM_STATUS_CONFIG[status]
            const label = isAll ? 'Tất cả' : config?.label

            return (
              <Badge
                key={status}
                className={
                  selectedStatus === status
                    ? 'cursor-pointer bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400'
                    : 'cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }
                onClick={() => setSelectedStatus(status)}
              >
                {label}
              </Badge>
            )
          })}
        </div>
      )}

      {/* Search */}
      <div className="relative ml-auto w-64">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Tìm đơn, bàn..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  )
}
