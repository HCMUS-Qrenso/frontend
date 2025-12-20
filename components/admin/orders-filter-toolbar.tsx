"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Download, ChevronDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminFilterToolbarWrapper } from "./admin-filter-toolbar-wrapper"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "new", label: "Mới/Chờ xử lý" },
  { value: "accepted", label: "Đã nhận" },
  { value: "preparing", label: "Đang chuẩn bị" },
  { value: "ready", label: "Sẵn sàng" },
  { value: "served", label: "Đã phục vụ" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
]

const TIME_RANGE_OPTIONS = [
  { value: "today", label: "Hôm nay" },
  { value: "last24h", label: "24h qua" },
  { value: "last7d", label: "7 ngày qua" },
  { value: "custom", label: "Tùy chỉnh" },
]

const MOCK_TABLES = [
  { id: "all", name: "Tất cả" },
  { id: "1", name: "Bàn 1" },
  { id: "2", name: "Bàn 2" },
  { id: "3", name: "Bàn 3" },
  { id: "5", name: "Bàn 5" },
  { id: "7", name: "Bàn 7" },
  { id: "12", name: "Bàn 12" },
]

export function OrdersFilterToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("q") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "all")
  const [tableId, setTableId] = useState(searchParams.get("tableId") || "all")
  const [timeRange, setTimeRange] = useState(searchParams.get("timeRange") || "today")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isConnected, setIsConnected] = useState(true)

  // Get display labels
  const selectedTableLabel = MOCK_TABLES.find((t) => t.id === tableId)?.name || "Tất cả"
  const selectedTimeRangeLabel = TIME_RANGE_OPTIONS.find((t) => t.value === timeRange)?.label || "Hôm nay"

  // Update URL params when filters change
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    // Handle default values - remove from URL if default
    const isDefaultValue =
      value === "" ||
      value === "all" ||
      (key === "timeRange" && value === "today")

    if (isDefaultValue) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/admin/orders?${params.toString()}`, { scroll: false })
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter("q", search)
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleStatusChange = (value: string) => {
    setStatus(value)
    updateFilter("status", value)
  }

  const handleTableChange = (value: string) => {
    setTableId(value)
    updateFilter("tableId", value)
  }

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    updateFilter("timeRange", value)
  }

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              status === option.value
                ? "bg-emerald-500 text-white dark:bg-emerald-600"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Filters & Actions */}
      <AdminFilterToolbarWrapper>
        {/* Left: Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm theo Order ID / khách / ghi chú..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border-slate-200 bg-slate-50 pr-4 pl-9 text-sm focus:bg-white sm:w-64 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
            />
          </div>

          {/* Table Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 gap-1 rounded-lg bg-transparent px-3">
                <span className="text-sm">Bàn: {selectedTableLabel}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {MOCK_TABLES.map((table) => (
                <DropdownMenuItem key={table.id} onClick={() => handleTableChange(table.id)}>
                  {table.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Time Range Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 gap-1 rounded-lg bg-transparent px-3">
                <span className="text-sm">Thời gian: {selectedTimeRangeLabel}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {TIME_RANGE_OPTIONS.map((option) => (
                <DropdownMenuItem key={option.value} onClick={() => handleTimeRangeChange(option.value)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <label
              htmlFor="auto-refresh"
              className="text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Tự động làm mới
            </label>
            {/* Connection Status */}
            <div
              className={cn("h-2 w-2 rounded-full", isConnected ? "bg-emerald-500" : "bg-red-500")}
              title={isConnected ? "Đã kết nối" : "Mất kết nối"}
            />
          </div>

          {/* Export Button */}
          <Button variant="outline" className="h-8 gap-1 rounded-lg bg-transparent px-3">
            <Download className="h-3 w-3" />
            <span className="hidden text-sm sm:inline">Xuất báo cáo</span>
          </Button>
        </div>
      </AdminFilterToolbarWrapper>
    </div>
  )
}
