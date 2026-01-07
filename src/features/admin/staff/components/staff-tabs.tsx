'use client'

import { useState } from 'react'
import { StaffDataTable } from '@/src/features/admin/staff/components/staff-data-table'
import { InviteStaffModal } from '@/src/features/admin/staff/components/invite-staff-modal'
import { StaffFilterToolbar } from '@/src/features/admin/staff/components/staff-filter-toolbar'
import { Users, UserCheck, UserX, UserMinus, Shield } from 'lucide-react'
import { SkeletonStatCard } from '@/src/components/loading'
import { cn } from '@/src/lib/utils'
import { StatCard } from '@/src/components/ui/stat-card'
import { useStaffStatsQuery } from '@/src/features/admin/staff/queries'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/src/features/auth/hooks'
import { useTranslations } from 'next-intl'

type StaffRole = 'admin' | 'waiter' | 'kitchen_staff'

export function StaffTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const t = useTranslations('staff')

  // Check if current user is Owner
  const isOwner = user?.role === 'owner'

  // Get role from URL, default to 'waiter'
  const activeRole = (searchParams.get('role') as StaffRole) || 'waiter'

  const [inviteSheetOpen, setInviteSheetOpen] = useState(false)

  // Fetch stats from API
  const { data: stats, isLoading: statsLoading } = useStaffStatsQuery()

  const handleRoleChange = (role: StaffRole) => {
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

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      {statsLoading ? (
        <SkeletonStatCard count={4} columns={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t('totalStaff')}
            value={String(stats?.total ?? 0)}
            subtext={t('allStaff')}
            icon={Users}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBgColor="bg-blue-100 dark:bg-blue-500/10"
          />
          <StatCard
            title={t('activeStaff')}
            value={String(stats?.summary?.active ?? 0)}
            subtext={t('activeLabel')}
            icon={UserCheck}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBgColor="bg-emerald-100 dark:bg-emerald-500/10"
          />
          <StatCard
            title={t('inactiveStaff')}
            value={String(stats?.summary?.inactive ?? 0)}
            subtext={t('inactiveLabel')}
            icon={UserX}
            iconColor="text-slate-600 dark:text-slate-400"
            iconBgColor="bg-slate-100 dark:bg-slate-500/10"
          />
          <StatCard
            title={t('suspendedStaff')}
            value={String(stats?.summary?.suspended ?? 0)}
            subtext={t('suspendedLabel')}
            icon={UserMinus}
            iconColor="text-red-600 dark:text-red-400"
            iconBgColor="bg-red-100 dark:bg-red-500/10"
          />
        </div>
      )}

      {/* Role Toggle Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Admin Tab - Only visible for Owner */}
        {isOwner && (
          <button
            onClick={() => handleRoleChange('admin')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeRole === 'admin'
                ? 'bg-violet-500 text-white dark:bg-violet-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
            )}
          >
            <Shield className="h-4 w-4" />
            {t('adminTab')} ({stats?.byRole?.admin?.total ?? 0})
          </button>
        )}
        <button
          onClick={() => handleRoleChange('waiter')}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            activeRole === 'waiter'
              ? 'bg-emerald-500 text-white dark:bg-emerald-600'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
          )}
        >
          {t('waiterTab')} ({stats?.byRole?.waiter?.total ?? 0})
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
          {t('kitchenTab')} ({stats?.byRole?.kitchen_staff?.total ?? 0})
        </button>
      </div>

      {/* Filter Toolbar */}
      <StaffFilterToolbar onInvite={() => setInviteSheetOpen(true)} />

      {/* Data Table */}
      <StaffDataTable role={activeRole} />

      {/* Invite Staff Sheet */}
      <InviteStaffModal
        open={inviteSheetOpen}
        onOpenChange={setInviteSheetOpen}
        defaultRole={activeRole === 'admin' ? 'waiter' : activeRole}
      />
    </div>
  )
}
