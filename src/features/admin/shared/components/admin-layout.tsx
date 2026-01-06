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
import { LanguageSwitcher } from '@/src/components/language-switcher'
import { useAuth, useUserProfileQuery } from '@/src/features/auth/hooks'
import {
  useOwnerTenantsQuery,
  useCurrentTenantQuery,
} from '@/src/features/admin/tenants/queries/tenants.queries'
import { useTenantStore } from '@/src/store/tenant-store'
import { invalidateTenantQueries } from '@/src/features/admin/tenants/utils'
import { AdminSidebar } from './admin-sidebar'
import { getInitials } from '../utils'
import { useTranslations } from 'next-intl'

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

  const t = useTranslations('admin')

  const selectedTenantName = useMemo(() => {
    if (isOwner) {
      const selected = tenants.find((t) => t.id === selectedTenantId)
      return selected?.name ?? t('selectRestaurant')
    }

    const detail = currentTenantQuery.data?.data
    return detail?.name ?? t('yourRestaurant')
  }, [isOwner, tenants, selectedTenantId, currentTenantQuery.data, t])

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
  const getPageHeader = (path: string): { title: string; description: string } => {
    // Exact matches for menu pages
    if (path === '/admin/menu/categories') {
      return { title: t('menuCategories'), description: t('menuCategoriesDesc') }
    }
    if (path === '/admin/menu/items') {
      return { title: t('menuItems'), description: t('menuItemsDesc') }
    }
    if (path === '/admin/menu/modifiers') {
      return { title: t('menuModifiers'), description: t('menuModifiersDesc') }
    }
    if (path === '/admin/menu/import-export') {
      return { title: t('menuImportExport'), description: t('menuImportExportDesc') }
    }
    if (path === '/admin/menu/templates') {
      return { title: t('menuTemplates'), description: t('menuTemplatesDesc') }
    }
    // Orders
    if (path === '/admin/orders' || path.startsWith('/admin/orders/')) {
      return { title: t('ordersTitle'), description: t('ordersDesc') }
    }
    // Staff
    if (path === '/admin/staff' || path.startsWith('/admin/staff/')) {
      return { title: t('staffTitle'), description: t('staffDesc') }
    }
    // Dashboard
    if (path === '/admin/dashboard' || path === '/admin') {
      return { title: t('dashboardTitle'), description: t('dashboardDesc') }
    }
    // Tables area
    if (path.startsWith('/admin/tables')) {
      if (path.startsWith('/admin/tables/list')) {
        return { title: t('tablesList'), description: t('tablesListDesc') }
      }
      if (path.startsWith('/admin/tables/layout')) {
        return { title: t('tablesLayout'), description: t('tablesLayoutDesc') }
      }
      if (path.startsWith('/admin/tables/qr')) {
        return { title: t('tablesQr'), description: t('tablesQrDesc') }
      }
      if (path.startsWith('/admin/tables/zones')) {
        return { title: t('tablesZones'), description: t('tablesZonesDesc') }
      }
      return { title: t('tablesGeneric'), description: t('tablesGenericDesc') }
    }
    // KDS
    if (path === '/admin/kds' || path.startsWith('/admin/kds/')) {
      return { title: t('kdsTitle'), description: t('kdsDesc') }
    }
    // Fallback
    return { title: t('dashboardTitle'), description: t('dashboardDesc') }
  }

  const currentPageHeader = useMemo(() => getPageHeader(pathname), [pathname, t])

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
                      <DropdownMenuItem disabled>{t('loadingList')}</DropdownMenuItem>
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
                      <DropdownMenuItem disabled>{t('noRestaurant')}</DropdownMenuItem>
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
                    <span className="hidden sm:inline">{t('today')}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>{t('today')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('thisWeek')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('thisMonth')}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>{t('custom')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Language Switcher */}
              <LanguageSwitcher />

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
                    {t('profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    {t('settings')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => setLogoutDialogOpen(true)}
                    disabled={logoutPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('logout')}
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
