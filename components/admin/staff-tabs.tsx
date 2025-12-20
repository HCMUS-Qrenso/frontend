"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StaffDataTable } from "@/components/admin/staff-data-table"
import { InviteStaffSheet } from "@/components/admin/invite-staff-sheet"
import { AdminFilterToolbarWrapper } from "@/components/admin/admin-filter-toolbar-wrapper"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, UserPlus, Search, ChevronDown, Users, UserCheck, UserX, UserMinus } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock stats
const MOCK_STATS = {
  waiter: { total: 3, active: 2, inactive: 1, suspended: 0 },
  kitchen_staff: { total: 3, active: 2, inactive: 0, suspended: 1 },
}

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
  { value: "suspended", label: "Đình chỉ" },
]

const VERIFIED_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "verified", label: "Đã xác thực" },
  { value: "unverified", label: "Chưa xác thực" },
]

const SORT_OPTIONS = [
  { value: "created_at", label: "Mới tạo" },
  { value: "full_name", label: "Tên A-Z" },
  { value: "last_login_at", label: "Đăng nhập gần đây" },
]

export function StaffTabs() {
  const [activeRole, setActiveRole] = useState<"waiter" | "kitchen_staff">("waiter")
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false)

  // Filters state (shared for the toolbar)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [verifiedFilter, setVerifiedFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")

  // Get display labels
  const selectedStatusLabel = STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label || "Tất cả trạng thái"
  const selectedVerifiedLabel = VERIFIED_OPTIONS.find((o) => o.value === verifiedFilter)?.label || "Tất cả"
  const selectedSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Mới tạo"

  // Stats for current role
  const stats = MOCK_STATS[activeRole]
  const totalAll = MOCK_STATS.waiter.total + MOCK_STATS.kitchen_staff.total

  const handleExportCSV = () => {
    console.log("Exporting CSV for", activeRole)
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tổng nhân viên</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalAll}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
              <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Đang hoạt động</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-500/10">
              <UserX className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Không hoạt động</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inactive}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">
              <UserMinus className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Đình chỉ</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.suspended}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Toggle Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveRole("waiter")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeRole === "waiter"
              ? "bg-emerald-500 text-white dark:bg-emerald-600"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
          )}
        >
          Phục vụ ({MOCK_STATS.waiter.total})
        </button>
        <button
          onClick={() => setActiveRole("kitchen_staff")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeRole === "kitchen_staff"
              ? "bg-emerald-500 text-white dark:bg-emerald-600"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
          )}
        >
          Bếp ({MOCK_STATS.kitchen_staff.total})
        </button>
      </div>

      {/* Filter Toolbar */}
      <AdminFilterToolbarWrapper>
        {/* Left: Filters + Sort */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm theo tên, email, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border-slate-200 bg-slate-50 pr-4 pl-9 text-sm focus:bg-white sm:w-56 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
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
            <DropdownMenuContent align="start" className="w-48">
              {STATUS_OPTIONS.map((option) => (
                <DropdownMenuItem key={option.value} onClick={() => setStatusFilter(option.value)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Verified Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 gap-1 rounded-lg bg-transparent px-3">
                <span className="text-sm">Xác thực: {selectedVerifiedLabel}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {VERIFIED_OPTIONS.map((option) => (
                <DropdownMenuItem key={option.value} onClick={() => setVerifiedFilter(option.value)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort - Now on left side */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 gap-1 rounded-lg bg-transparent px-3">
                <span className="text-sm">Sắp xếp: {selectedSortLabel}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem key={option.value} onClick={() => setSortBy(option.value)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="h-8 gap-1 rounded-lg bg-transparent px-3">
            <Download className="h-3 w-3" />
            <span className="hidden text-sm sm:inline">Xuất CSV</span>
          </Button>
          <Button 
            onClick={() => setInviteSheetOpen(true)} 
            className="h-8 gap-1 rounded-lg bg-emerald-600 px-3 hover:bg-emerald-700"
          >
            <UserPlus className="h-3 w-3" />
            <span className="text-sm">Mời nhân viên</span>
          </Button>
        </div>
      </AdminFilterToolbarWrapper>

      {/* Data Table */}
      <StaffDataTable 
        role={activeRole} 
        searchQuery={search}
        statusFilter={statusFilter}
        verifiedFilter={verifiedFilter}
        sortBy={sortBy}
      />

      {/* Invite Staff Sheet */}
      <InviteStaffSheet open={inviteSheetOpen} onOpenChange={setInviteSheetOpen} defaultRole={activeRole} />
    </div>
  )
}
