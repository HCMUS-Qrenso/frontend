'use client'

import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { StatusBadge, USER_ROLE_CONFIG, USER_STATUS_CONFIG } from '@/components/ui/status-badge'
import { StaffRowActions } from '@/components/admin/staff-row-actions'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import { CheckCircle2, XCircle, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStaffQuery } from '@/hooks/use-staff-query'
import { useSearchParams, useRouter } from 'next/navigation'
import type { StaffQueryParams } from '@/types/staff'

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

  // Loading state
  if (isLoading) {
    return <LoadingState />
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
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/80 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Nhân viên
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Liên hệ
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Vai trò
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Trạng thái
              </TableHead>
              <TableHead className="px-6 py-3 text-center text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Xác thực
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Đăng nhập cuối
              </TableHead>
              <TableHead className="px-6 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Thao tác
              </TableHead>
            </TableRow>
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
                <TableRow
                  key={staff.id}
                  className={cn(
                    'border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800',
                    index === staffList.length - 1 && 'border-b-0',
                  )}
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hiển thị {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} trên {pagination.total}{' '}
            nhân viên
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-transparent"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(
              (pageNum) => (
                <Button
                  key={pageNum}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-8 w-8 rounded-full',
                    pageNum === pagination.page
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                      : 'bg-transparent',
                  )}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-transparent"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
