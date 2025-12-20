"use client"

import { useState, useMemo, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge, USER_STATUS_CONFIG, USER_ROLE_CONFIG } from "@/components/ui/status-badge"
import { StaffRowActions } from "@/components/admin/staff-row-actions"
import { LoadingState } from "@/components/ui/loading-state"
import { EmptyState } from "@/components/ui/empty-state"
import { CheckCircle2, XCircle, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: "waiter" | "kitchen_staff"
  tenant_id: string
  email_verified: boolean
  status: "active" | "inactive" | "suspended"
  last_login_at: string | null
  created_at: string
  updated_at: string
}



// Mock data
const mockWaiters: User[] = [
  {
    id: "1",
    email: "nguyen.van.a@restaurant.com",
    full_name: "Nguyễn Văn A",
    phone: "+84 912 345 678",
    avatar_url: null,
    role: "waiter",
    tenant_id: "tenant-1",
    email_verified: true,
    status: "active",
    last_login_at: "2024-01-15T10:30:00Z",
    created_at: "2023-11-01T08:00:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    email: "tran.thi.b@restaurant.com",
    full_name: "Trần Thị B",
    phone: "+84 923 456 789",
    avatar_url: null,
    role: "waiter",
    tenant_id: "tenant-1",
    email_verified: true,
    status: "active",
    last_login_at: "2024-01-15T09:15:00Z",
    created_at: "2023-11-15T08:00:00Z",
    updated_at: "2024-01-15T09:15:00Z",
  },
  {
    id: "3",
    email: "le.van.c@restaurant.com",
    full_name: "Lê Văn C",
    phone: "+84 934 567 890",
    avatar_url: null,
    role: "waiter",
    tenant_id: "tenant-1",
    email_verified: false,
    status: "inactive",
    last_login_at: null,
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-10T08:00:00Z",
  },
]

const mockKitchenStaff: User[] = [
  {
    id: "4",
    email: "pham.van.d@restaurant.com",
    full_name: "Phạm Văn D",
    phone: "+84 945 678 901",
    avatar_url: null,
    role: "kitchen_staff",
    tenant_id: "tenant-1",
    email_verified: true,
    status: "active",
    last_login_at: "2024-01-15T07:00:00Z",
    created_at: "2023-10-01T08:00:00Z",
    updated_at: "2024-01-15T07:00:00Z",
  },
  {
    id: "5",
    email: "hoang.thi.e@restaurant.com",
    full_name: "Hoàng Thị E",
    phone: "+84 956 789 012",
    avatar_url: null,
    role: "kitchen_staff",
    tenant_id: "tenant-1",
    email_verified: true,
    status: "active",
    last_login_at: "2024-01-15T06:45:00Z",
    created_at: "2023-10-15T08:00:00Z",
    updated_at: "2024-01-15T06:45:00Z",
  },
  {
    id: "6",
    email: "vu.van.f@restaurant.com",
    full_name: "Vũ Văn F",
    phone: "+84 967 890 123",
    avatar_url: null,
    role: "kitchen_staff",
    tenant_id: "tenant-1",
    email_verified: true,
    status: "suspended",
    last_login_at: "2024-01-10T08:00:00Z",
    created_at: "2023-12-01T08:00:00Z",
    updated_at: "2024-01-12T08:00:00Z",
  },
]

interface StaffDataTableProps {
  role: "waiter" | "kitchen_staff"
  searchQuery?: string
  statusFilter?: string
  verifiedFilter?: string
  sortBy?: string
}

export function StaffDataTable({
  role,
  searchQuery = "",
  statusFilter = "all",
  verifiedFilter = "all",
  sortBy = "created_at",
}: StaffDataTableProps) {
  const rawData = role === "waiter" ? mockWaiters : mockKitchenStaff
  const [data, setData] = useState<User[]>(rawData)
  const [isLoading, setIsLoading] = useState(false)

  // Update data when role changes
  useEffect(() => {
    setData(role === "waiter" ? mockWaiters : mockKitchenStaff)
  }, [role])

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...data]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === statusFilter)
    }

    // Verified filter
    if (verifiedFilter !== "all") {
      const isVerified = verifiedFilter === "verified"
      result = result.filter((user) => user.email_verified === isVerified)
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "full_name") {
        return a.full_name.localeCompare(b.full_name)
      } else if (sortBy === "created_at") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === "last_login_at") {
        const aTime = a.last_login_at ? new Date(a.last_login_at).getTime() : 0
        const bTime = b.last_login_at ? new Date(b.last_login_at).getTime() : 0
        return bTime - aTime
      }
      return 0
    })

    return result
  }, [data, searchQuery, statusFilter, verifiedFilter, sortBy])

  const formatDate = (date: string | null) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (date: string | null) => {
    if (!date) return "—"
    return new Date(date).toLocaleString("vi-VN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Loading state
  if (isLoading) {
    return <LoadingState />
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
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-0">
                  <EmptyState
                    icon={Users}
                    title={role === "waiter" ? "Chưa có nhân viên phục vụ nào" : "Chưa có nhân viên bếp nào"}
                    description="Nhấn 'Mời nhân viên' để thêm nhân viên mới"
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((user, index) => (
                <TableRow
                  key={user.id}
                  className={cn(
                    "border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800",
                    index === filteredData.length - 1 && "border-b-0",
                  )}
                >
                  {/* Staff Info */}
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{user.full_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Tham gia {formatDate(user.created_at)}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact */}
                  <TableCell className="px-6 py-4">
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{user.email}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user.phone || "—"}</p>
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell className="px-6 py-4">
                    <StatusBadge status={user.role} config={USER_ROLE_CONFIG} />
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-6 py-4">
                    <StatusBadge status={user.status} config={USER_STATUS_CONFIG} />
                  </TableCell>

                  {/* Email Verified */}
                  <TableCell className="px-6 py-4 text-center">
                    {user.email_verified ? (
                      <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="mx-auto h-5 w-5 text-slate-400" />
                    )}
                  </TableCell>

                  {/* Last Login */}
                  <TableCell className="px-6 py-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDateTime(user.last_login_at)}
                    </p>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <StaffRowActions
                        user={user}
                        onUpdate={(updatedUser) => {
                          setData((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
