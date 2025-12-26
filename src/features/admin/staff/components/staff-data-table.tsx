'use client'

import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  AdminTableContainer,
  AdminTableHeaderRow,
  AdminTableHead,
  AdminTableRow,
} from '@/src/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Button } from '@/src/components/ui/button'
import { StatusBadge, USER_ROLE_CONFIG, USER_STATUS_CONFIG } from '@/src/components/ui/status-badge'
import { StaffRowActions } from '@/src/features/admin/staff/components/staff-row-actions'
import { LoadingState } from '@/src/components/ui/loading-state'
import { EmptyState } from '@/src/components/ui/empty-state'
import { CheckCircle2, XCircle, Users } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { useStaffQuery } from '@/src/features/admin/staff/queries'
import { SkeletonTableRows } from '@/src/components/loading'
import { useSearchParams, useRouter } from 'next/navigation'
import type { StaffQueryParams } from '@/src/features/admin/staff/types'
import { TablePagination } from '@/src/components/ui/table-pagination'

interface StaffDataTableProps {
  role: 'admin' | 'waiter' | 'kitchen_staff'
}

export function StaffDataTable({ role }: StaffDataTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Read filters from URL params
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const emailVerified = searchParams.get('email_verified') || ''
  const sortBy = searchParams.get('sort_by') || 'createdAt'
  const sortOrder = searchParams.get('sort_order') || 'desc'
  const page = parseInt(searchParams.get('page') || '1', 10)

  // Build query params for API
  const queryParams = useMemo<StaffQueryParams>(() => {
    const params: StaffQueryParams = {
      role,
      page,
      limit: 20,
      sortBy: sortBy as 'createdAt' | 'fullName' | 'lastLoginAt',
      sortOrder: sortOrder as 'asc' | 'desc',
    }

    if (search) {
      params.search = search
    }

    if (status) {
      params.status = status as 'active' | 'inactive' | 'suspended'
    }

    if (emailVerified) {
      params.emailVerified = emailVerified === 'true'
    }

    return params
  }, [role, search, status, emailVerified, sortBy, sortOrder, page])

  // Fetch data from API
  const { data, isLoading, error } = useStaffQuery(queryParams)

  const staffList = data?.items ?? []
  const pagination = data?.meta

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/admin/staff?${params.toString()}`)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (date: string | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleString('vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Loading state - skeleton rows to avoid layout shift
  if (isLoading) {
    return (
      <div className="space-y-4">
        <AdminTableContainer>
          <Table>
            <TableHeader>
              <AdminTableHeaderRow>
                <AdminTableHead>Nhân viên</AdminTableHead>
                <AdminTableHead>Liên hệ</AdminTableHead>
                <AdminTableHead>Vai trò</AdminTableHead>
                <AdminTableHead>Trạng thái</AdminTableHead>
                <AdminTableHead align="center">Xác thực</AdminTableHead>
                <AdminTableHead>Đăng nhập cuối</AdminTableHead>
                <AdminTableHead align="right">Thao tác</AdminTableHead>
              </AdminTableHeaderRow>
            </TableHeader>
            <TableBody>
              <SkeletonTableRows
                rowCount={5}
                columns={[
                  { type: 'avatar-with-text' },
                  { type: 'text-with-subtext' },
                  { type: 'badge' },
                  { type: 'badge' },
                  { type: 'avatar', align: 'center' },
                  { type: 'text' },
                  { type: 'actions', align: 'right', actionCount: 1 },
                ]}
              />
            </TableBody>
          </Table>
        </AdminTableContainer>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-500/10">
        <p className="text-sm text-red-600 dark:text-red-400">
          Có lỗi xảy ra khi tải danh sách nhân viên. Vui lòng thử lại.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <AdminTableContainer>
        <Table>
          <TableHeader>
            <AdminTableHeaderRow>
              <AdminTableHead>Nhân viên</AdminTableHead>
              <AdminTableHead>Liên hệ</AdminTableHead>
              <AdminTableHead>Vai trò</AdminTableHead>
              <AdminTableHead>Trạng thái</AdminTableHead>
              <AdminTableHead align="center">Xác thực</AdminTableHead>
              <AdminTableHead>Đăng nhập cuối</AdminTableHead>
              <AdminTableHead align="right">Thao tác</AdminTableHead>
            </AdminTableHeaderRow>
          </TableHeader>
          <TableBody>
            {staffList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-0">
                  <EmptyState
                    icon={Users}
                    title={
                      role === 'waiter'
                        ? 'Chưa có nhân viên phục vụ nào'
                        : 'Chưa có nhân viên bếp nào'
                    }
                    description="Nhấn 'Mời nhân viên' để thêm nhân viên mới"
                  />
                </TableCell>
              </TableRow>
            ) : (
              staffList.map((staff, index) => (
                <AdminTableRow
                  key={staff.id}
                  isLast={index === staffList.length - 1}
                >
                  {/* Staff Info */}
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={staff.avatarUrl || undefined} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          {getInitials(staff.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {staff.fullName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Tham gia {formatDate(staff.createdAt)}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact */}
                  <TableCell className="px-6 py-4">
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{staff.email}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {staff.phone || '—'}
                      </p>
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell className="px-6 py-4">
                    <StatusBadge status={staff.role} config={USER_ROLE_CONFIG} />
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-6 py-4">
                    <StatusBadge status={staff.status} config={USER_STATUS_CONFIG} />
                  </TableCell>

                  {/* Email Verified */}
                  <TableCell className="px-6 py-4 text-center">
                    {staff.emailVerified ? (
                      <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="mx-auto h-5 w-5 text-slate-400" />
                    )}
                  </TableCell>

                  {/* Last Login */}
                  <TableCell className="px-6 py-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDateTime(staff.lastLoginAt)}
                    </p>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <StaffRowActions staff={staff} />
                    </div>
                  </TableCell>
                </AdminTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableContainer>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          itemLabel="nhân viên"
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}
