'use client'

import { useState } from 'react'
import { StaffDataTable } from '@/components/admin/staff-data-table'
import { InviteStaffSheet } from '@/components/admin/invite-staff-sheet'
import { StaffFilterToolbar } from '@/components/admin/staff-filter-toolbar'
import { Users, UserCheck, UserX, UserMinus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/ui/stat-card'
import { useStaffStatsQuery } from '@/hooks/use-staff-query'
import { useSearchParams, useRouter } from 'next/navigation'

export function StaffTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get role from URL, default to 'waiter'
  const activeRole = (searchParams.get('role') as 'waiter' | 'kitchen_staff') || 'waiter'

  const [inviteSheetOpen, setInviteSheetOpen] = useState(false)

  // Fetch stats from API
  const { data: stats, isLoading: statsLoading } = useStaffStatsQuery()

  const handleRoleChange = (role: 'waiter' | 'kitchen_staff') => {
    const params = new URLSearchParams(searchParams.toString())
    if (role === 'waiter') {
      params.delete('role')
    } else {
      params.set('role', role)
    }
    // Reset page when switching roles
    params.delete('page')
    router.push(`/admin/staff?${params.toString()}`)
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
          onClick={() => handleRoleChange('waiter')}
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
          onClick={() => handleRoleChange('kitchen_staff')}
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
      <StaffFilterToolbar onInvite={() => setInviteSheetOpen(true)} />

      {/* Data Table */}
      <StaffDataTable role={activeRole} />

      {/* Invite Staff Sheet */}
      <InviteStaffSheet
        open={inviteSheetOpen}
        onOpenChange={setInviteSheetOpen}
        defaultRole={activeRole}
      />
    </div>
  )
}
