"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  QrCode,
  Users,
  BarChart3,
  Settings,
  Moon,
  Sun,
  ChevronDown,
  Menu,
  X,
  Store,
  LogOut,
  User,
  Table,
  LayoutGrid,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"

interface AdminLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: ClipboardList, label: "Orders", href: "/admin/orders" },
  { icon: UtensilsCrossed, label: "Menu", href: "/admin/menu" },
  {
    icon: QrCode,
    label: "Tables & QR",
    href: "/admin/tables/list",
    subItems: [
      { icon: Table, label: "Table List", href: "/admin/tables/list" },
      { icon: LayoutGrid, label: "Layout", href: "/admin/tables/layout" },
      { icon: QrCode, label: "QR Manager", href: "/admin/tables/qr" },
    ],
  },
  { icon: Users, label: "Staff", href: "/admin/staff" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const pathname = usePathname()

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 dark:text-white">Smart Restaurant</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href)
              const hasSubItems = item.subItems && item.subItems.length > 0

              return (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>

                  {hasSubItems && isActive && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-emerald-200 pl-4 dark:border-emerald-500/20">
                      {item.subItems?.map((subItem) => {
                        const isSubActive = pathname === subItem.href
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                              isSubActive
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : "text-slate-500 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800",
                            )}
                          >
                            <subItem.icon className="h-4 w-4" />
                            {subItem.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Bottom */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800 px-4 py-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/restaurant-owner-avatar.png" />
                <AvatarFallback>NT</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Nguyễn Thành</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Chủ nhà hàng</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white lg:text-2xl">Dashboard</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tổng quan hôm nay</p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              {/* Restaurant Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hidden gap-2 rounded-full md:flex bg-transparent">
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
              <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

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
                  <DropdownMenuItem className="text-red-600">
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
