"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreVertical, Printer, ChevronRight, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatusBadge, type StatusConfig } from "@/components/ui/status-badge"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

// Mock data
const MOCK_ORDERS = [
  {
    id: "ORD-1024",
    tableId: "5",
    tableName: "Bàn 5",
    floor: "Tầng 1",
    items: [
      { name: "Phở bò", quantity: 2 },
      { name: "Bánh xèo", quantity: 1 },
      { name: "Cà phê sữa", quantity: 2 },
    ],
    status: "new",
    paymentStatus: "unpaid",
    total: 285000,
    createdAt: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
    customerName: "Nguyễn Văn A",
    note: "Không hành",
  },
  {
    id: "ORD-1023",
    tableId: "3",
    tableName: "Bàn 3",
    floor: "Tầng 1",
    items: [
      { name: "Bún chả", quantity: 3 },
      { name: "Nem rán", quantity: 1 },
    ],
    status: "preparing",
    paymentStatus: "unpaid",
    total: 420000,
    createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    customerName: "Trần Thị B",
    note: "",
  },
  {
    id: "ORD-1022",
    tableId: "7",
    tableName: "Bàn 7",
    floor: "Tầng 2",
    items: [
      { name: "Cơm gà", quantity: 2 },
      { name: "Canh chua", quantity: 1 },
      { name: "Trà đá", quantity: 2 },
    ],
    status: "ready",
    paymentStatus: "unpaid",
    total: 350000,
    createdAt: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
    customerName: "Lê Văn C",
    note: "",
  },
  {
    id: "ORD-1021",
    tableId: "2",
    tableName: "Bàn 2",
    floor: "Tầng 1",
    items: [
      { name: "Phở gà", quantity: 1 },
      { name: "Gỏi cuốn", quantity: 2 },
    ],
    status: "served",
    paymentStatus: "unpaid",
    total: 185000,
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    customerName: "Phạm Thị D",
    note: "",
  },
  {
    id: "ORD-1020",
    tableId: "12",
    tableName: "Bàn 12",
    floor: "Tầng 2",
    items: [
      { name: "Lẩu thái", quantity: 1 },
      { name: "Rau củ", quantity: 1 },
      { name: "Nước ngọt", quantity: 4 },
    ],
    status: "preparing",
    paymentStatus: "unpaid",
    total: 580000,
    createdAt: new Date(Date.now() - 18 * 60 * 1000), // 18 minutes ago
    customerName: "Hoàng Văn E",
    note: "Không cay",
  },
  {
    id: "ORD-1019",
    tableId: "1",
    tableName: "Bàn 1",
    floor: "Tầng 1",
    items: [
      { name: "Bún bò Huế", quantity: 2 },
      { name: "Chả giò", quantity: 1 },
    ],
    status: "new",
    paymentStatus: "unpaid",
    total: 260000,
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    customerName: "Đỗ Thị F",
    note: "",
  },
  {
    id: "ORD-1018",
    tableId: "5",
    tableName: "Bàn 5",
    floor: "Tầng 1",
    items: [
      { name: "Cơm chiên dương châu", quantity: 1 },
      { name: "Canh chua cá", quantity: 1 },
    ],
    status: "completed",
    paymentStatus: "paid",
    total: 180000,
    createdAt: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
    customerName: "Vũ Văn G",
    note: "",
  },
]

const STATUS_CONFIG: Record<string, StatusConfig> = {
  new: { label: "Mới", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" },
  accepted: { label: "Đã nhận", className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20" },
  preparing: { label: "Đang chuẩn bị", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" },
  ready: { label: "Sẵn sàng", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" },
  served: { label: "Đã phục vụ", className: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20" },
  completed: { label: "Hoàn thành", className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20" },
  cancelled: { label: "Đã hủy", className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20" },
}

const PAYMENT_STATUS_CONFIG: Record<string, StatusConfig> = {
  unpaid: { label: "Chưa TT", className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20" },
  paid: { label: "Đã TT", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" },
  refunded: { label: "Hoàn tiền", className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20" },
}

const NEXT_STATUS_MAP: Record<string, string> = {
  new: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "served",
  served: "completed",
}

export function OrdersTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState(MOCK_ORDERS)
  const [isLoading, setIsLoading] = useState(false)

  // Pagination state (mock)
  const page = 1
  const totalPages = 1
  const total = orders.length

  const handleBumpStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: NEXT_STATUS_MAP[order.status] || order.status } : order,
      ),
    )
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`)
  }

  const getAgingMinutes = (createdAt: Date) => {
    return Math.floor((Date.now() - createdAt.getTime()) / 60000)
  }

  const isAging = (createdAt: Date) => {
    return getAgingMinutes(createdAt) > 20
  }


  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-100 bg-white/80 py-12 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/80 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
              <TableHead className="px-4 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Mã đơn
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Bàn
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Món
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Trạng thái
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Thanh toán
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Tổng tiền
              </TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Thời gian
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có đơn nào</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Thử Reset filter hoặc chọn khoảng thời gian khác
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order, index) => {
                const aging = getAgingMinutes(order.createdAt)
                const isOverdue = isAging(order.createdAt)

                return (
                  <TableRow
                    key={order.id}
                    className={cn(
                      "cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800",
                      index === orders.length - 1 && "border-b-0",
                    )}
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <TableCell className="px-4 py-4">
                      <div>
                        <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{order.id}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDistanceToNow(order.createdAt, { addSuffix: true, locale: vi })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{order.tableName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{order.floor}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="group relative">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{order.items.length} món</p>
                        {/* Tooltip */}
                        <div className="invisible absolute bottom-full left-0 z-10 mb-2 w-64 rounded-lg border border-slate-200 bg-white p-3 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-800">
                          <p className="mb-2 text-xs font-semibold text-slate-900 dark:text-white">Chi tiết món:</p>
                          <ul className="space-y-1">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <li key={idx} className="text-xs text-slate-600 dark:text-slate-400">
                                {item.quantity}x {item.name}
                              </li>
                            ))}
                            {order.items.length > 3 && (
                              <li className="text-xs text-slate-500 dark:text-slate-500">
                                +{order.items.length - 3} món khác
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <StatusBadge status={order.status} config={STATUS_CONFIG} />
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <StatusBadge status={order.paymentStatus} config={PAYMENT_STATUS_CONFIG} />
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <p className="font-semibold text-slate-900 dark:text-white">{order.total.toLocaleString("vi-VN")}₫</p>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {isOverdue && <AlertCircle className="h-3 w-3 text-red-500" />}
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isOverdue ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300",
                          )}
                        >
                          {aging}m
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {/* Bump/Next Status */}
                        {NEXT_STATUS_MAP[order.status] && (
                          <Button
                            variant="outline"
                            className="h-7 gap-1 rounded-full bg-transparent px-2 text-xs md:h-8 md:px-3"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleBumpStatus(order.id)
                            }}
                          >
                            Tiếp
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        )}

                        {/* View Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full md:h-8 md:w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewOrder(order.id)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* More Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full md:h-8 md:w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOrder(order.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              In bill
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Thay đổi trạng thái...</DropdownMenuItem>
                            <DropdownMenuItem>Xuất PDF</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hiển thị 1-{total} trên {total} đơn
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-transparent"
              disabled={page === 1}
            >
              Trước
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 w-8 rounded-full",
                  pageNum === page
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                    : "bg-transparent",
                )}
              >
                {pageNum}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-transparent"
              disabled={page === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
