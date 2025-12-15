'use client'

import type React from 'react'

import { useState } from 'react'
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="hidden gap-2 rounded-full bg-transparent md:flex"
                  >
                    <Store className="h-4 w-4" />
                    <span>Chi nhánh Quận 1</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>Chi nhánh Quận 1</DropdownMenuItem>
                  <DropdownMenuItem>Chi nhánh Quận 3</DropdownMenuItem>
                  <DropdownMenuItem>Chi nhánh Quận 7</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
