'use client'

import type React from 'react'

import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, Store, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSearchParams } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/hooks/use-auth'
import { useUserProfileQuery } from '@/hooks/use-users-query'
import { useOwnerTenantsQuery, useCurrentTenantQuery } from '@/hooks/use-tenants-query'
import { useTenantStore } from '@/store/tenant-store'
import { invalidateTenantQueries } from '@/lib/query-utils'
import { AdminSidebar } from './admin-sidebar'
import { getInitials } from './admin-utils'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const searchParams = useSearchParams()
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
                  Bảng điều khiển
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tổng quan hôm nay</p>
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
