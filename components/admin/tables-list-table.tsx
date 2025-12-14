'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Edit2, MoreVertical, MapPin, Trash2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Table {
  id: string
  number: string
  seats: number
  area: string
  floor: string
  status: 'available' | 'occupied' | 'maintenance'
  currentOrder?: string
}

const mockTables: Table[] = [
  {
    id: '1',
    number: '1',
    seats: 4,
    area: 'Tầng 1 - Khu cửa sổ',
    floor: 'Tầng 1',
    status: 'occupied',
    currentOrder: '#ORD-1234',
  },
  {
    id: '2',
    number: '2',
    seats: 2,
    area: 'Tầng 1 - Khu cửa sổ',
    floor: 'Tầng 1',
    status: 'available',
  },
  {
    id: '3',
    number: '3',
    seats: 6,
    area: 'Tầng 1 - Trung tâm',
    floor: 'Tầng 1',
    status: 'occupied',
    currentOrder: '#ORD-1235',
  },
  {
    id: '4',
    number: '4',
    seats: 4,
    area: 'Tầng 1 - Trung tâm',
    floor: 'Tầng 1',
    status: 'available',
  },
  {
    id: '5',
    number: '5',
    seats: 4,
    area: 'Tầng 2 - VIP',
    floor: 'Tầng 2',
    status: 'occupied',
    currentOrder: '#ORD-1236',
  },
  { id: '6', number: '6', seats: 8, area: 'Tầng 2 - VIP', floor: 'Tầng 2', status: 'available' },
  {
    id: '7',
    number: '7',
    seats: 2,
    area: 'Tầng 2 - Khu ban công',
    floor: 'Tầng 2',
    status: 'available',
  },
  {
    id: '8',
    number: '8',
    seats: 4,
    area: 'Khu ngoài trời',
    floor: 'Khu ngoài trời',
    status: 'occupied',
    currentOrder: '#ORD-1237',
  },
  {
    id: '9',
    number: '9',
    seats: 4,
    area: 'Khu ngoài trời',
    floor: 'Khu ngoài trời',
    status: 'maintenance',
  },
  {
    id: '10',
    number: '10',
    seats: 6,
    area: 'Tầng 1 - Trung tâm',
    floor: 'Tầng 1',
    status: 'occupied',
    currentOrder: '#ORD-1238',
  },
]

function getStatusBadge(status: Table['status']) {
  const config = {
    available: {
      label: 'Trống',
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
    occupied: {
      label: 'Đang sử dụng',
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    },
    maintenance: {
      label: 'Bảo trì',
      className:
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    },
  }

  const statusConfig = config[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusConfig.className,
      )}
    >
      {statusConfig.label}
    </span>
  )
}

export function TablesListTable() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleEdit = (tableId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'table')
    params.set('mode', 'edit')
    params.set('id', tableId)
    router.push(`/admin/tables/list?${params.toString()}`)
  }

  const handleDelete = (tableId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('delete', tableId)
    router.push(`/admin/tables/list?${params.toString()}`)
  }

  const handleViewOnLayout = (table: Table) => {
    router.push(`/admin/tables/layout?floor=${encodeURIComponent(table.floor)}&tableId=${table.id}`)
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Bàn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Khu vực / Tầng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Sức chứa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Đơn hàng hiện tại
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {mockTables.map((table, index) => (
              <tr
                key={table.id}
                className={cn(
                  'border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800',
                  index === mockTables.length - 1 && 'border-b-0',
                )}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Bàn #{table.number}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {table.seats} chỗ ngồi
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{table.area}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{table.seats}</p>
                </td>
                <td className="px-6 py-4">{getStatusBadge(table.status)}</td>
                <td className="px-6 py-4">
                  {table.currentOrder ? (
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {table.currentOrder}
                    </p>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleEdit(table.id)}
                      title="Chỉnh sửa bàn"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(table.id)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewOnLayout(table)}>
                          <MapPin className="mr-2 h-4 w-4" />
                          Xem trên sơ đồ
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(table.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">Hiển thị 1-10 trên 42 bàn</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full bg-transparent" disabled>
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
          >
            1
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 rounded-full bg-transparent">
            2
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 rounded-full bg-transparent">
            3
          </Button>
          <Button variant="outline" size="sm" className="rounded-full bg-transparent">
            Sau
          </Button>
        </div>
      </div>
    </div>
  )
}
