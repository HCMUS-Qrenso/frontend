'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import {
  ArrowLeft,
  Copy,
  Printer,
  FileDown,
  MoreVertical,
  AlertTriangle,
  Check,
} from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { OverrideStatusModal } from './override-status-modal'

// Mock data
const MOCK_ORDER = {
  id: 'ORD-1024',
  order_number: 'ORD-1024',
  table_id: '5',
  tableName: 'Bàn 5',
  floor: 'Tầng 1',
  status: 'preparing',
  priority: 'normal',
  created_at: new Date(Date.now() - 18 * 60 * 1000),
  total_amount: 285000,
}

const STATUS_CONFIG = {
  pending: {
    label: 'Chờ xử lý',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
  },
  accepted: {
    label: 'Đã nhận',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  },
  in_progress: {
    label: 'Đang xử lý',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  },
  preparing: {
    label: 'Đang chuẩn bị',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  },
  ready: {
    label: 'Sẵn sàng',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  served: {
    label: 'Đã phục vụ',
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
  },
  completed: {
    label: 'Hoàn thành',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
  },
  rejected: {
    label: 'Từ chối',
    color: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  },
}

const PRIORITY_CONFIG = {
  normal: {
    label: 'Bình thường',
    color: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400',
  },
  high: {
    label: 'Cao',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  },
  urgent: { label: 'Gấp', color: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' },
  vip: {
    label: 'VIP',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  },
}

interface OrderSummaryHeaderProps {
  orderId: string
}

export function OrderSummaryHeader({ orderId }: OrderSummaryHeaderProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [overrideModalOpen, setOverrideModalOpen] = useState(false)

  const order = MOCK_ORDER

  const handleCopy = () => {
    navigator.clipboard.writeText(order.order_number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.open(`/admin/orders/${orderId}/print`, '_blank')
  }

  const handleExport = (format: 'json' | 'pdf') => {
    console.log(`[v0] Exporting order ${orderId} as ${format}`)
    // API call to generate export
  }

  return (
    <>
      <div className="space-y-4">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push('/admin/orders')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Đơn hàng
        </Button>

        {/* Header Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            {/* Left: Order Info */}
            <div className="space-y-3">
              {/* Title */}
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                  Đơn hàng #{order.order_number}
                </h1>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Table Info */}
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-lg font-medium">{order.tableName}</span>
                <span className="text-sm">•</span>
                <span className="text-sm">{order.floor}</span>
              </div>

              {/* Meta Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    'text-xs font-medium',
                    STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.color,
                  )}
                >
                  {STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.label}
                </Badge>

                <Badge
                  className={cn(
                    'text-xs font-medium',
                    PRIORITY_CONFIG[order.priority as keyof typeof PRIORITY_CONFIG]?.color,
                  )}
                >
                  {PRIORITY_CONFIG[order.priority as keyof typeof PRIORITY_CONFIG]?.label}
                </Badge>

                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {formatDistanceToNow(order.created_at, { addSuffix: true, locale: vi })}
                </span>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={handlePrint} className="gap-2 bg-transparent">
                <Printer className="h-4 w-4" />
                In bill
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <FileDown className="h-4 w-4" />
                    Xuất
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    Xuất JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>Xuất PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="default"
                onClick={() => setOverrideModalOpen(true)}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <AlertTriangle className="h-4 w-4" />
                Thay đổi trạng thái
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Giao cho nhân viên</DropdownMenuItem>
                  <DropdownMenuItem>Thay đổi ưu tiên</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Hủy đơn</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Override Status Modal */}
      <OverrideStatusModal
        orderId={orderId}
        currentStatus={order.status}
        open={overrideModalOpen}
        onOpenChange={setOverrideModalOpen}
      />
    </>
  )
}
