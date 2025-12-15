'use client'

import type React from 'react'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
  X,
  LogOut,
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
import { getInitials, getRoleLabel } from './admin-utils'

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

interface AdminSidebarProps {
  isModalOpen: boolean
  userProfile?: {
    fullName: string
    avatarUrl?: string | null
    role: string
  } | null
  logout: () => Promise<unknown>
  logoutPending: boolean
  sidebarOpen: boolean
  onSidebarToggle: (open: boolean) => void
  logoutDialogOpen?: boolean
  onLogoutDialogOpenChange?: (open: boolean) => void
}

export function AdminSidebar({
  isModalOpen,
  userProfile,
  logout,
  logoutPending,
  sidebarOpen,
  onSidebarToggle,
  logoutDialogOpen: controlledLogoutDialogOpen,
  onLogoutDialogOpenChange,
}: AdminSidebarProps) {
  const [internalLogoutDialogOpen, setInternalLogoutDialogOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Use controlled state if provided, otherwise use internal state
  const logoutDialogOpen =
    controlledLogoutDialogOpen !== undefined
      ? controlledLogoutDialogOpen
      : internalLogoutDialogOpen
  const setLogoutDialogOpen =
    onLogoutDialogOpenChange || setInternalLogoutDialogOpen

  // Initialize openSubmenus based on current pathname to avoid jank
  const initialOpenSubmenus = useMemo(() => {
    const initial = new Set<string>()
    menuItems.forEach((item) => {
      if (item.subItems) {
        const shouldBeOpen = item.subItems.some(
          (subItem) => pathname === subItem.href || pathname?.startsWith(subItem.href),
        )
        if (shouldBeOpen) {
          initial.add(item.label)
        }
      }
    })
    return initial
  }, [pathname])

  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(initialOpenSubmenus)

  // Update openSubmenus when pathname changes, but only if needed
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subItems) {
        const shouldBeOpen = item.subItems.some(
          (subItem) => pathname === subItem.href || pathname?.startsWith(subItem.href),
        )
        if (shouldBeOpen) {
          setOpenSubmenus((prev) => {
            // Only update if not already in set to avoid unnecessary re-renders
            if (!prev.has(item.label)) {
              const newSet = new Set(prev)
              newSet.add(item.label)
              return newSet
            }
            return prev
          })
        }
      }
    })
  }, [pathname])

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

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && !isModalOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => onSidebarToggle(false)}
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
              onClick={() => onSidebarToggle(false)}
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
                        'overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out',
                        isSubmenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0',
                      )}
                      style={{
                        // Use will-change to optimize transitions
                        willChange: isSubmenuOpen ? 'max-height, opacity' : 'auto',
                      }}
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
                <AvatarImage src={userProfile?.avatarUrl || undefined} />
                <AvatarFallback>
                  {userProfile ? getInitials(userProfile.fullName) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                  {userProfile?.fullName || 'Người dùng'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {userProfile ? getRoleLabel(userProfile.role) : 'Đang tải...'}
                </p>
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
    </>
  )
}

