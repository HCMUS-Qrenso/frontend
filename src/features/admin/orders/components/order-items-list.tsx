'use client'

import { useState } from 'react'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { cn } from '@/src/lib/utils'
import { Clock, Check, XCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

// Mock data
const MOCK_ITEMS = [
  {
    id: 'item-1',
    menu_item_id: 'mi-1',
    menu_item_name: 'Phở bò',
    quantity: 2,
    unit_price: 85000,
    modifiers: [
      { modifier_name: 'Thêm thịt', price_adjustment: 20000 },
      { modifier_name: 'Ít hành', price_adjustment: 0 },
    ],
    modifiers_total: 40000,
    subtotal: 210000,
    status: 'preparing',
    special_instructions: 'Không hành',
    preparation_started_at: new Date(Date.now() - 5 * 60 * 1000),
    estimated_prep_time: 15,
  },
  {
    id: 'item-2',
    menu_item_id: 'mi-2',
    menu_item_name: 'Bánh xèo',
    quantity: 1,
    unit_price: 45000,
    modifiers: [],
    modifiers_total: 0,
    subtotal: 45000,
    status: 'ready',
    special_instructions: null,
    preparation_started_at: new Date(Date.now() - 12 * 60 * 1000),
    preparation_completed_at: new Date(Date.now() - 2 * 60 * 1000),
    estimated_prep_time: 10,
    actual_prep_time: 10,
  },
  {
    id: 'item-3',
    menu_item_id: 'mi-3',
    menu_item_name: 'Cà phê sữa',
    quantity: 2,
    unit_price: 25000,
    modifiers: [{ modifier_name: 'Ít đá', price_adjustment: 0 }],
    modifiers_total: 0,
    subtotal: 50000,
    status: 'served',
    special_instructions: null,
    preparation_started_at: new Date(Date.now() - 15 * 60 * 1000),
    preparation_completed_at: new Date(Date.now() - 10 * 60 * 1000),
    served_at: new Date(Date.now() - 8 * 60 * 1000),
    estimated_prep_time: 5,
    actual_prep_time: 5,
  },
]

const ITEM_STATUS_CONFIG = {
  pending: {
    label: 'Chờ xử lý',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
    icon: Clock,
  },
  accepted: {
    label: 'Đã nhận',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
    icon: Check,
  },
  preparing: {
    label: 'Đang chuẩn bị',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    icon: Clock,
  },
  ready: {
    label: 'Sẵn sàng',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    icon: Check,
  },
  served: {
    label: 'Đã phục vụ',
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
    icon: Check,
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    icon: XCircle,
  },
  returned: {
    label: 'Trả lại',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
    icon: AlertCircle,
  },
}

interface OrderItemsListProps {
  orderId: string
}

export function OrderItemsList({ orderId }: OrderItemsListProps) {
  const [items, setItems] = useState(MOCK_ITEMS)

  const handleMarkReady = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: 'ready' } : item)),
    )
  }

  const handleMarkServed = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: 'served' } : item)),
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Danh sách món</h2>

      <div className="space-y-4">
        {items.map((item) => {
          const StatusIcon =
            ITEM_STATUS_CONFIG[item.status as keyof typeof ITEM_STATUS_CONFIG]?.icon

          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                {/* Left: Item Info */}
                <div className="flex-1 space-y-2">
                  {/* Name + Qty */}
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      {item.quantity}x
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {item.menu_item_name}
                    </h3>
                  </div>

                  {/* Modifiers */}
                  {item.modifiers.length > 0 && (
                    <div className="ml-11 space-y-1">
                      {item.modifiers.map((mod, idx) => (
                        <p key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                          + {mod.modifier_name}
                          {mod.price_adjustment > 0 && (
                            <span className="ml-2 font-medium text-emerald-600 dark:text-emerald-400">
                              +{mod.price_adjustment.toLocaleString('vi-VN')}₫
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Special Instructions */}
                  {item.special_instructions && (
                    <div className="ml-11 flex items-start gap-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-500/10">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {item.special_instructions}
                      </p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="ml-11 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {item.preparation_started_at && (
                      <span>
                        Bắt đầu: {format(item.preparation_started_at, 'HH:mm', { locale: vi })}
                      </span>
                    )}
                    {item.preparation_completed_at && (
                      <span>
                        Xong: {format(item.preparation_completed_at, 'HH:mm', { locale: vi })}
                      </span>
                    )}
                    {item.served_at && (
                      <span>Phục vụ: {format(item.served_at, 'HH:mm', { locale: vi })}</span>
                    )}
                  </div>
                </div>

                {/* Right: Price + Status + Actions */}
                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                  {/* Price */}
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.unit_price.toLocaleString('vi-VN')}₫ × {item.quantity}
                    </p>
                    {item.modifiers_total > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        +{item.modifiers_total.toLocaleString('vi-VN')}₫
                      </p>
                    )}
                    <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                      {item.subtotal.toLocaleString('vi-VN')}₫
                    </p>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    className={cn(
                      'gap-1 text-xs font-medium',
                      ITEM_STATUS_CONFIG[item.status as keyof typeof ITEM_STATUS_CONFIG]?.color,
                    )}
                  >
                    {StatusIcon && <StatusIcon className="h-3 w-3" />}
                    {ITEM_STATUS_CONFIG[item.status as keyof typeof ITEM_STATUS_CONFIG]?.label}
                  </Badge>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {item.status === 'preparing' && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkReady(item.id)}>
                        Sẵn sàng
                      </Button>
                    )}
                    {item.status === 'ready' && (
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleMarkServed(item.id)}
                      >
                        Đã phục vụ
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
