'use client'

import type React from 'react'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/src/lib/utils'
import { Button } from '@/src/components/ui/button'
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
  FolderOpen,
  Upload,
  MapPin,
  Construction,
  ShipIcon,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { getInitials, getRoleLabel } from '../utils'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

  // Menu items with translation keys
  const menuItems = useMemo(
    () => [
      { icon: LayoutDashboard, labelKey: 'menuOverview', href: '/admin/dashboard' },
      { icon: ClipboardList, labelKey: 'menuOrders', href: '/admin/orders' },
      { icon: ShipIcon, labelKey: 'menuKds', href: '/admin/kds' },
      {
        icon: UtensilsCrossed,
        labelKey: 'menuLabel',
        href: '/admin/menu',
        subItems: [
          { icon: FolderOpen, labelKey: 'menuCateg', href: '/admin/menu/categories' },
          { icon: UtensilsCrossed, labelKey: 'menuItemsLabel', href: '/admin/menu/items' },
          { icon: Settings, labelKey: 'menuModifiersLabel', href: '/admin/menu/modifiers' },
          { icon: Upload, labelKey: 'menuImportLabel', href: '/admin/menu/import-export' },
          { icon: LayoutGrid, labelKey: 'menuTemplatesLabel', href: '/admin/menu/templates' },
        ],
      },
      {
        icon: QrCode,
        labelKey: 'menuTablesQr',
        href: '/admin/tables/list',
        subItems: [
          { icon: Table, labelKey: 'menuTablesList', href: '/admin/tables/list' },
          { icon: LayoutGrid, labelKey: 'menuLayout', href: '/admin/tables/layout' },
          { icon: QrCode, labelKey: 'menuQrManager', href: '/admin/tables/qr' },
          { icon: MapPin, labelKey: 'menuZones', href: '/admin/tables/zones' },
        ],
      },
      { icon: Users, labelKey: 'menuStaff', href: '/admin/staff' },
      { icon: BarChart3, labelKey: 'menuReports', href: '/admin/reports', wip: true },
      { icon: Settings, labelKey: 'menuSettings', href: '/admin/settings', wip: true },
    ],
    [],
  )

  // Use controlled state if provided, otherwise use internal state
  const logoutDialogOpen =
    controlledLogoutDialogOpen !== undefined ? controlledLogoutDialogOpen : internalLogoutDialogOpen
  const setLogoutDialogOpen = onLogoutDialogOpenChange || setInternalLogoutDialogOpen

  // Initialize openSubmenus based on current pathname to avoid jank
  const initialOpenSubmenus = useMemo(() => {
    const initial = new Set<string>()
    menuItems.forEach((item) => {
      if (item.subItems) {
        const shouldBeOpen = item.subItems.some(
          (subItem) => pathname === subItem.href || pathname?.startsWith(subItem.href),
        )
        if (shouldBeOpen) {
          initial.add(item.labelKey)
        }
      }
    })
    return initial
  }, [pathname, menuItems])

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
            if (!prev.has(item.labelKey)) {
              const newSet = new Set(prev)
              newSet.add(item.labelKey)
              return newSet
            }
            return prev
          })
        }
      }
    })
  }, [pathname, menuItems])

  const handleLogout = async () => {
    try {
      await logout()
      setLogoutDialogOpen(false)
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleSubmenu = (itemLabelKey: string) => {
    setOpenSubmenus((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemLabelKey)) {
        newSet.delete(itemLabelKey)
      } else {
        newSet.add(itemLabelKey)
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
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5.5 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl">
              <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 dark:text-white">Qrenso</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('sidebarSubtitle')}</p>
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

              const isSubmenuOpen = hasSubItems && openSubmenus.has(item.labelKey)
              const label = t(item.labelKey)

              return (
                <div key={item.labelKey}>
                  {hasSubItems ? (
                    <button
                      onClick={() => toggleSubmenu(item.labelKey)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {label}
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
                      {label}
                      {item.wip && (
                        <span title={t('wipHint')}>
                          <Construction className="ml-auto h-4 w-4 text-amber-500" />
                        </span>
                      )}
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
                              {t(subItem.labelKey)}
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
            <Link href="/admin/profile" className="block">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={userProfile?.avatarUrl || undefined} />
                  <AvatarFallback>
                    {userProfile ? getInitials(userProfile.fullName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {userProfile?.fullName || t('defaultUser')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {userProfile ? getRoleLabel(userProfile.role) : t('loadingUser')}
                  </p>
                </div>
              </div>
            </Link>
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
              {t('logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('logoutConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('logoutConfirmDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={logoutPending}>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={logoutPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {logoutPending ? t('loggingOut') : t('logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
