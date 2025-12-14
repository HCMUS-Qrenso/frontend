'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  QrCode,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Store,
  LogOut,
  User,
  Table,
  LayoutGrid,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/hooks/use-auth'

interface AdminLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', href: '/admin/dashboard' },
  { icon: ClipboardList, label: 'Đơn hàng', href: '/admin/orders' },
  { icon: UtensilsCrossed, label: 'Thực đơn', href: '/admin/menu' },
  {
    icon: QrCode,
    label: 'Bàn & QR',
    href: '/admin/tables/list',
    subItems: [
      { icon: Table, label: 'Danh sách bàn', href: '/admin/tables/list' },
      { icon: LayoutGrid, label: 'Sơ đồ', href: '/admin/tables/layout' },
      { icon: QrCode, label: 'Quản lý QR', href: '/admin/tables/qr' },
    ],
  },
  { icon: Users, label: 'Nhân viên', href: '/admin/staff' },
  { icon: BarChart3, label: 'Báo cáo', href: '/admin/reports' },
  { icon: Settings, label: 'Cài đặt', href: '/admin/settings' },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set())
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { logout, logoutPending } = useAuth()

  // Check if any modal is open
  const isModalOpen = searchParams.get('modal') !== null || searchParams.get('delete') !== null

  const handleLogout = async () => {
    try {
      await logout()
      setLogoutDialogOpen(false)
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleSubmenu = (itemLabel: string) => {
    setOpenSubmenus((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemLabel)) {
        newSet.delete(itemLabel)
      } else {
        newSet.add(itemLabel)
      }
      return newSet
    })
  }

  // Tự động mở submenu khi pathname match với submenu item
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subItems) {
        const shouldBeOpen = item.subItems.some(
          (subItem) => pathname === subItem.href || pathname?.startsWith(subItem.href),
        )
        if (shouldBeOpen) {
          setOpenSubmenus((prev) => {
            const newSet = new Set(prev)
            newSet.add(item.label)
            return newSet
          })
        }
      }
    })
  }, [pathname])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && !isModalOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          isModalOpen && 'lg:hidden',
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 dark:text-white">Smart Restaurant</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Bảng điều khiển quản trị</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {menuItems.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0
              const isActive =
                pathname === item.href ||
                pathname?.startsWith(item.href) ||
                (hasSubItems &&
                  item.subItems?.some(
                    (subItem) => pathname === subItem.href || pathname?.startsWith(subItem.href),
                  ))

              const isSubmenuOpen = hasSubItems && openSubmenus.has(item.label)

              return (
                <div key={item.label}>
                  {hasSubItems ? (
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </div>
                      {isSubmenuOpen ? (
                        <ChevronDown className="h-4 w-4 transition-transform" />
                      ) : (
                        <ChevronRight className="h-4 w-4 transition-transform" />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )}

                  {hasSubItems && (
                    <div
                      className={cn(
                        'overflow-hidden transition-all duration-300 ease-in-out',
                        isSubmenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0',
                      )}
                    >
                      <div className="mt-1 ml-4 space-y-1 border-l-2 border-emerald-200 pl-4 dark:border-emerald-500/20">
                        {item.subItems?.map((subItem) => {
                          const isSubActive = pathname === subItem.href
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                                isSubActive
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800',
                              )}
                            >
                              <subItem.icon className="h-4 w-4" />
                              {subItem.label}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Bottom */}
          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/restaurant-owner-avatar.png" />
                <AvatarFallback>NT</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                  Nguyễn Thành
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Chủ nhà hàng</p>
              </div>
            </div>
            <button
              onClick={() => setLogoutDialogOpen(true)}
              disabled={logoutPending}
              className={cn(
                'mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10',
                logoutPending && 'cursor-not-allowed opacity-50',
              )}
            >
              <LogOut className="h-5 w-5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

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
                      <AvatarImage src="/diverse-user-avatars.png" />
                      <AvatarFallback>NT</AvatarFallback>
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

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống? Bạn sẽ cần đăng nhập lại để tiếp tục sử
              dụng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={logoutPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={logoutPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {logoutPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
