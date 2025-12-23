'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { StaffDataTable } from '@/components/admin/staff-data-table'
import { InviteStaffSheet } from '@/components/admin/invite-staff-sheet'
import { AdminFilterToolbarWrapper } from '@/components/admin/admin-filter-toolbar-wrapper'
import { SearchInput } from '@/components/ui/search-input'
import { FilterDropdown, type FilterOption } from '@/components/ui/filter-dropdown'
import { Download, UserPlus, Users, UserCheck, UserX, UserMinus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/ui/stat-card'

// Mock stats
const MOCK_STATS = {
  waiter: { total: 3, active: 2, inactive: 1, suspended: 0 },
  kitchen_staff: { total: 3, active: 2, inactive: 0, suspended: 1 },
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
  { value: 'suspended', label: 'Đình chỉ' },
]

const VERIFIED_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'verified', label: 'Đã xác thực' },
  { value: 'unverified', label: 'Chưa xác thực' },
]

const SORT_OPTIONS: FilterOption[] = [
  { value: 'created_at', label: 'Mới tạo' },
  { value: 'full_name', label: 'Tên A-Z' },
  { value: 'last_login_at', label: 'Đăng nhập gần đây' },
]

export function StaffTabs() {
  const [activeRole, setActiveRole] = useState<'waiter' | 'kitchen_staff'>('waiter')
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false)

  // Filters state (shared for the toolbar)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [verifiedFilter, setVerifiedFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')

  // Stats for current role
  const stats = MOCK_STATS[activeRole]
  const totalAll = MOCK_STATS.waiter.total + MOCK_STATS.kitchen_staff.total

  const handleExportCSV = () => {
    console.log('Exporting CSV for', activeRole)
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng nhân viên"
          value={totalAll.toString()}
          subtext="Tất cả nhân viên"
          icon={Users}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBgColor="bg-blue-100 dark:bg-blue-500/10"
        />
        <StatCard
          title="Đang hoạt động"
          value={stats.active.toString()}
          subtext="Active"
          icon={UserCheck}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBgColor="bg-emerald-100 dark:bg-emerald-500/10"
        />
        <StatCard
          title="Không hoạt động"
          value={stats.inactive.toString()}
          subtext="Inactive"
          icon={UserX}
          iconColor="text-slate-600 dark:text-slate-400"
          iconBgColor="bg-slate-100 dark:bg-slate-500/10"
        />
        <StatCard
          title="Đình chỉ"
          value={stats.suspended.toString()}
          subtext="Suspended"
          icon={UserMinus}
          iconColor="text-red-600 dark:text-red-400"
          iconBgColor="bg-red-100 dark:bg-red-500/10"
        />
      </div>

      {/* Role Toggle Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveRole('waiter')}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            activeRole === 'waiter'
              ? 'bg-emerald-500 text-white dark:bg-emerald-600'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
          )}
        >
          Phục vụ ({MOCK_STATS.waiter.total})
        </button>
        <button
          onClick={() => setActiveRole('kitchen_staff')}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            activeRole === 'kitchen_staff'
              ? 'bg-emerald-500 text-white dark:bg-emerald-600'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
          )}
        >
          Bếp ({MOCK_STATS.kitchen_staff.total})
        </button>
      </div>

      {/* Filter Toolbar */}
      <AdminFilterToolbarWrapper>
        {/* Left: Filters + Sort */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            placeholder="Tìm theo tên, email, SĐT..."
            value={search}
            onChange={setSearch}
            width="sm:w-56"
          />

          <FilterDropdown
            label="Trạng thái:"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={setStatusFilter}
          />

          <FilterDropdown
            label="Xác thực:"
            value={verifiedFilter}
            options={VERIFIED_OPTIONS}
            onChange={setVerifiedFilter}
          />

          <FilterDropdown
            label="Sắp xếp:"
            value={sortBy}
            options={SORT_OPTIONS}
            onChange={setSortBy}
          />
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="h-8 gap-1 rounded-lg bg-transparent px-3"
          >
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
      <InviteStaffSheet
        open={inviteSheetOpen}
        onOpenChange={setInviteSheetOpen}
        defaultRole={activeRole}
      />
    </div>
  )
}
