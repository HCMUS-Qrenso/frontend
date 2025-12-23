'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { StaffDataTable } from '@/components/admin/staff-data-table'
import { InviteStaffSheet } from '@/components/admin/invite-staff-sheet'
import { AdminFilterToolbarWrapper } from '@/components/admin/admin-filter-toolbar-wrapper'
import { SearchInput } from '@/components/ui/search-input'
import { FilterDropdown, type FilterOption } from '@/components/ui/filter-dropdown'
import { Download, UserPlus, Users, UserCheck, UserX, UserMinus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/ui/stat-card'
import { useStaffStatsQuery } from '@/hooks/use-staff-query'

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
  { value: 'suspended', label: 'Đình chỉ' },
]

const VERIFIED_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'true', label: 'Đã xác thực' },
  { value: 'false', label: 'Chưa xác thực' },
]

const SORT_OPTIONS: FilterOption[] = [
  { value: 'createdAt', label: 'Mới tạo' },
  { value: 'fullName', label: 'Tên A-Z' },
  { value: 'lastLoginAt', label: 'Đăng nhập gần đây' },
]

export function StaffTabs() {
  const [activeRole, setActiveRole] = useState<'waiter' | 'kitchen_staff'>('waiter')
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false)

  // Filters state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [verifiedFilter, setVerifiedFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')

  // Fetch stats from API
  const { data: stats, isLoading: statsLoading } = useStaffStatsQuery()

  const handleExportCSV = () => {
    console.log('Exporting CSV for', activeRole)
  }

  // Stats loading skeleton
  const renderStatsSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-center rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
        >
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      {statsLoading ? (
        renderStatsSkeleton()
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng nhân viên"
            value={String(stats?.total ?? 0)}
            subtext="Tất cả nhân viên"
            icon={Users}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBgColor="bg-blue-100 dark:bg-blue-500/10"
          />
          <StatCard
            title="Đang hoạt động"
            value={String(stats?.summary?.active ?? 0)}
            subtext="Active"
            icon={UserCheck}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBgColor="bg-emerald-100 dark:bg-emerald-500/10"
          />
          <StatCard
            title="Không hoạt động"
            value={String(stats?.summary?.inactive ?? 0)}
            subtext="Inactive"
            icon={UserX}
            iconColor="text-slate-600 dark:text-slate-400"
            iconBgColor="bg-slate-100 dark:bg-slate-500/10"
          />
          <StatCard
            title="Đình chỉ"
            value={String(stats?.summary?.suspended ?? 0)}
            subtext="Suspended"
            icon={UserMinus}
            iconColor="text-red-600 dark:text-red-400"
            iconBgColor="bg-red-100 dark:bg-red-500/10"
          />
        </div>
      )}

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
          Phục vụ ({stats?.byRole?.waiter?.total ?? 0})
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
          Bếp ({stats?.byRole?.kitchen_staff?.total ?? 0})
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
