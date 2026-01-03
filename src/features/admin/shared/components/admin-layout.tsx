'use client'

import type React from 'react'

import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Menu, Store, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { useSearchParams, usePathname } from 'next/navigation'
import { ThemeToggle } from '@/src/components/theme-toggle'
import { useAuth, useUserProfileQuery } from '@/src/features/auth/hooks'
import {
  useOwnerTenantsQuery,
  useCurrentTenantQuery,
} from '@/src/features/admin/tenants/queries/tenants.queries'
import { useTenantStore } from '@/src/store/tenant-store'
import { invalidateTenantQueries } from '@/src/features/admin/tenants/utils'
import { AdminSidebar } from './admin-sidebar'
import { getInitials } from '../utils'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { logout, logoutPending, isAuthenticated, isHydrated } = useAuth()
  const userProfileQuery = useUserProfileQuery(isAuthenticated && isHydrated)
  const userProfile = userProfileQuery.data
  const hasProfile = !!userProfile

  const isOwner = hasProfile && userProfile.role === 'owner'
  const isStaff = hasProfile && userProfile.role !== 'owner'

  // Tenant state (used mainly for owners)
  const { tenants, selectedTenantId, setTenants, selectTenant } = useTenantStore()

  // Owner: fetch all owned tenants (without x-tenant-id)
  const ownerTenantsQuery = useOwnerTenantsQuery(
    { status: 'active', limit: 50 },
    isAuthenticated && isHydrated && isOwner,
  )

  // Current tenant details:
  // - Owner: only fetch after a tenant has been selected (selectedTenantId set)
  // - Admin/staff: fetch as soon as profile is known
  const shouldFetchCurrentForOwner = isOwner && !!selectedTenantId
  const shouldFetchCurrentForStaff = isStaff

  const currentTenantQuery = useCurrentTenantQuery(
    isAuthenticated && isHydrated && (shouldFetchCurrentForOwner || shouldFetchCurrentForStaff),
  )

  // Debug logging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (userProfileQuery.data) {
        console.log('[AdminLayout] ✅ /users/profile loaded:', userProfileQuery.data)
      }
      if (ownerTenantsQuery.data) {
        console.log(
          '[AdminLayout] ✅ /tenants loaded:',
          ownerTenantsQuery.data.data.tenants.length,
          'tenants',
        )
      }
      if (currentTenantQuery.data) {
        console.log('[AdminLayout] ✅ /tenants/current loaded:', currentTenantQuery.data.data.name)
      }
    }
  }, [userProfileQuery.data, ownerTenantsQuery.data, currentTenantQuery.data])

  // Sync owner tenants list into tenant store
  useEffect(() => {
    if (!isOwner) return
    if (!ownerTenantsQuery.data?.data.tenants) return

    setTenants(ownerTenantsQuery.data.data.tenants)

    // If no tenant selected yet but we have data, auto-select the first one
    if (!selectedTenantId && ownerTenantsQuery.data.data.tenants.length > 0) {
      const firstTenantId = ownerTenantsQuery.data.data.tenants[0].id
      if (process.env.NODE_ENV === 'development') {
        console.log('[AdminLayout] 🔄 Auto-selecting first tenant:', firstTenantId)
      }
      // Use selectTenant directly for auto-select (no need to invalidate on initial load)
      selectTenant(firstTenantId)
    }
  }, [isOwner, ownerTenantsQuery.data, selectedTenantId, setTenants, selectTenant])

  const selectedTenantName = useMemo(() => {
    if (isOwner) {
      const selected = tenants.find((t) => t.id === selectedTenantId)
      return selected?.name ?? 'Chọn nhà hàng'
    }

    const detail = currentTenantQuery.data?.data
    return detail?.name ?? 'Nhà hàng của bạn'
  }, [isOwner, tenants, selectedTenantId, currentTenantQuery.data])

  // Query client for invalidating queries
  const queryClient = useQueryClient()

  // Handle tenant selection with query invalidation
  const handleSelectTenant = (tenantId: string) => {
    // Update store and x-tenant-id header
    selectTenant(tenantId)

    // Invalidate all tenant-dependent queries
    // This ensures all data is refetched with the new tenant context
    invalidateTenantQueries(queryClient)
  }

  // Check if any modal is open
  const isModalOpen = searchParams.get('modal') !== null || searchParams.get('delete') !== null

  // Helper: resolve page header (title + description) based on current pathname.
  // Để thêm header cho trang mới /admin/xxx, chỉ cần thêm case mới vào hàm này.
  const getPageHeader = (path: string): { title: string; description: string } => {
    // Exact matches for menu pages
    if (path === '/admin/menu/categories') {
      return {
        title: 'Thực đơn / Danh mục',
        description: 'Quản lý danh mục để nhóm món ăn; thay đổi sẽ ảnh hưởng filter ở trang Món ăn',
      }
    }

    if (path === '/admin/menu/items') {
      return {
        title: 'Thực đơn / Món ăn',
        description: 'Quản lý món, trạng thái bán, ảnh và tuỳ chọn (modifiers)',
      }
    }

    if (path === '/admin/menu/modifiers') {
      return {
        title: 'Thực đơn / Nhóm tuỳ chọn (Modifiers)',
        description: 'Quản lý các nhóm tuỳ chọn (Size, Topping...) và các option trong từng nhóm',
      }
    }

    if (path === '/admin/menu/import-export') {
      return {
        title: 'Import / Export Thực đơn',
        description: 'Nhập dữ liệu từ CSV/Excel, xuất backup dữ liệu menu',
      }
    }

    if (path === '/admin/menu/templates') {
      return {
        title: 'Menu Templates',
        description: 'Tạo menu đẹp với các template có sẵn, xuất PDF/PNG để in ấn',
      }
    }

    // Orders
    if (path === '/admin/orders' || path.startsWith('/admin/orders/')) {
      return {
        title: 'Đơn hàng',
        description: 'Theo dõi và xử lý đơn theo thời gian thực',
      }
    }

    // Staff
    if (path === '/admin/staff' || path.startsWith('/admin/staff/')) {
      return {
        title: 'Nhân viên',
        description: 'Quản lý tài khoản phục vụ & bếp theo nhà hàng',
      }
    }

    // Dashboard
    if (path === '/admin/dashboard' || path === '/admin') {
      return {
        title: 'Bảng điều khiển',
        description: 'Tổng quan hôm nay',
      }
    }

    // Tables area (list, layout, qr, zones under tables)
    if (path.startsWith('/admin/tables')) {
      // More specific sub-routes
      if (path.startsWith('/admin/tables/list')) {
        return {
          title: 'Bàn / Danh sách',
          description: 'Xem và quản lý danh sách bàn theo dạng bảng, thuận tiện cho thao tác nhanh',
        }
      }

      if (path.startsWith('/admin/tables/layout')) {
        return {
          title: 'Bàn / Sơ đồ',
          description:
            'Quản lý sơ đồ bàn theo mặt bằng nhà hàng, kéo thả và sắp xếp vị trí trực quan',
        }
      }

      if (path.startsWith('/admin/tables/qr')) {
        return {
          title: 'Bàn / QR Code',
          description: 'Tạo và tải QR Code cho từng bàn để khách gọi món trực tiếp',
        }
      }

      if (path.startsWith('/admin/tables/zones')) {
        return {
          title: 'Khu vực / Danh sách',
          description: 'Quản lý các khu vực (Zone) trong nhà hàng để nhóm và phân chia bàn',
        }
      }

      // Generic tables fallback
      return {
        title: 'Bàn / Quản lý',
        description: 'Quản lý bàn, sơ đồ và QR Code cho nhà hàng của bạn',
      }
    }

    // KDS
    if (path === '/admin/kds' || path.startsWith('/admin/kds/')) {
      return {
        title: 'KDS - Global View',
        description: 'Màn hình theo dõi và xử lý đơn bếp theo thời gian thực',
      }
    }

    // Fallback: dashboard-style default
    return {
      title: 'Bảng điều khiển',
      description: 'Tổng quan hôm nay',
    }
  }

  const currentPageHeader = useMemo(() => getPageHeader(pathname), [pathname])

  // Wrapper to ensure logout returns Promise<void>
  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <AdminSidebar
        isModalOpen={isModalOpen}
        userProfile={userProfile}
        logout={handleLogout}
        logoutPending={logoutPending}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={setSidebarOpen}
        logoutDialogOpen={logoutDialogOpen}
        onLogoutDialogOpenChange={setLogoutDialogOpen}
      />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 lg:text-2xl dark:text-white">
                  {currentPageHeader.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {currentPageHeader.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              {/* Restaurant Selector */}
              {isOwner ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="hidden gap-2 rounded-full bg-transparent md:flex"
                      disabled={ownerTenantsQuery.isLoading}
                    >
                      <Store className="h-4 w-4" />
                      <span>{selectedTenantName}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {ownerTenantsQuery.isLoading && (
                      <DropdownMenuItem disabled>Đang tải danh sách...</DropdownMenuItem>
                    )}
                    {!ownerTenantsQuery.isLoading &&
                      tenants.map((tenant) => (
                        <DropdownMenuItem
                          key={tenant.id}
                          onClick={() => handleSelectTenant(tenant.id)}
                        >
                          {tenant.name}
                        </DropdownMenuItem>
                      ))}
                    {!ownerTenantsQuery.isLoading && tenants.length === 0 && (
                      <DropdownMenuItem disabled>Chưa có nhà hàng nào</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  className="hidden gap-2 rounded-full bg-transparent md:flex"
                  disabled
                >
                  <Store className="h-4 w-4" />
                  <span>{selectedTenantName}</span>
                </Button>
              )}

              {/* Date Range */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 rounded-full bg-transparent">
                    <span className="hidden sm:inline">Hôm nay</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Hôm nay</DropdownMenuItem>
                  <DropdownMenuItem>Tuần này</DropdownMenuItem>
                  <DropdownMenuItem>Tháng này</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Tùy chọn...</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile?.avatarUrl || undefined} />
                      <AvatarFallback>
                        {userProfile ? getInitials(userProfile.fullName) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Hồ sơ
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => setLogoutDialogOpen(true)}
                    disabled={logoutPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
