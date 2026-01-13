/**
 * Navigation configuration with role-based access control
 * Defines which navigation items are visible to which roles in the admin management system
 * Note: Only staff roles are included (no guest/customer)
 */

import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  QrCode,
  Users,
  BarChart3,
  Settings,
  Table,
  LayoutGrid,
  FolderOpen,
  Upload,
  MapPin,
  ShipIcon,
  CircleDollarSignIcon,
} from 'lucide-react'
import { ROLES } from '@/src/types/roles'

export interface NavigationItem {
  icon: LucideIcon
  labelKey: string
  href: string
  wip?: boolean
  allowedRoles?: string[] // If not specified, accessible to all authenticated users
  subItems?: NavigationSubItem[]
}

export interface NavigationSubItem {
  icon: LucideIcon
  labelKey: string
  href: string
  allowedRoles?: string[] // If not specified, inherits from parent or accessible to all
}

/**
 * Main navigation configuration
 * Each item can specify allowedRoles to control access
 */
export const NAVIGATION_CONFIG: NavigationItem[] = [
  {
    icon: LayoutDashboard,
    labelKey: 'menuOverview',
    href: '/admin/dashboard',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN],
  },
  {
    icon: ClipboardList,
    labelKey: 'menuOrders',
    href: '/admin/orders',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN, ROLES.WAITER],
  },
  {
    icon: ShipIcon,
    labelKey: 'menuKds',
    href: '/admin/kds',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN, ROLES.KITCHEN],
  },
  {
    icon: UtensilsCrossed,
    labelKey: 'menuLabel',
    href: '/admin/menu',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN],
    subItems: [
      {
        icon: FolderOpen,
        labelKey: 'menuCateg',
        href: '/admin/menu/categories',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN],
      },
      {
        icon: UtensilsCrossed,
        labelKey: 'menuItemsLabel',
        href: '/admin/menu/items',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN],
      },
      {
        icon: Settings,
        labelKey: 'menuModifiersLabel',
        href: '/admin/menu/modifiers',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN],
      },
      {
        icon: Upload,
        labelKey: 'menuImportLabel',
        href: '/admin/menu/import-export',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN],
      },
      {
        icon: LayoutGrid,
        labelKey: 'menuTemplatesLabel',
        href: '/admin/menu/templates',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN],
      },
    ],
  },
  {
    icon: QrCode,
    labelKey: 'menuTablesQr',
    href: '/admin/tables/list',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN, ROLES.WAITER],
    subItems: [
      {
        icon: Table,
        labelKey: 'menuTablesList',
        href: '/admin/tables/list',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN, ROLES.WAITER],
      },
      {
        icon: LayoutGrid,
        labelKey: 'menuLayout',
        href: '/admin/tables/layout',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN],
      },
      {
        icon: QrCode,
        labelKey: 'menuQrManager',
        href: '/admin/tables/qr',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN],
      },
      {
        icon: MapPin,
        labelKey: 'menuZones',
        href: '/admin/tables/zones',
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN],
      },
    ],
  },
  {
    icon: CircleDollarSignIcon,
    labelKey: 'menuVouchers',
    href: '/admin/vouchers',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN],
  },
  {
    icon: Users,
    labelKey: 'menuStaff',
    href: '/admin/staff',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN],
  },
  // {
  //   icon: BarChart3,
  //   labelKey: 'menuReports',
  //   href: '/admin/reports',
  //   wip: true,
  //   allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN],
  // },
  {
    icon: Settings,
    labelKey: 'menuSettings',
    href: '/admin/settings',
    wip: false,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.ADMIN],
  },
]

/**
 * Filter navigation items based on user role
 * Returns only items that the user has access to
 */
export function filterNavigationByRole(
  items: NavigationItem[],
  userRole: string | undefined | null,
): NavigationItem[] {
  if (!userRole) return []

  return items
    .filter((item) => {
      // If no allowedRoles specified, item is accessible to all authenticated users
      if (!item.allowedRoles) return true
      return item.allowedRoles.includes(userRole)
    })
    .map((item) => {
      // Filter sub-items if they exist
      if (item.subItems) {
        const filteredSubItems = item.subItems.filter((subItem) => {
          // If no allowedRoles specified on subItem, check parent's allowedRoles
          if (!subItem.allowedRoles) {
            return !item.allowedRoles || item.allowedRoles.includes(userRole)
          }
          return subItem.allowedRoles.includes(userRole)
        })

        // Only return parent item if it has accessible sub-items or is directly accessible
        if (filteredSubItems.length === 0 && item.subItems.length > 0) {
          return { ...item, subItems: [] }
        }

        return { ...item, subItems: filteredSubItems }
      }

      return item
    })
    .filter((item) => {
      // Remove items that only had sub-items and now have none after filtering
      if (item.subItems !== undefined && item.subItems.length === 0) {
        // Check if original item had sub-items (meaning it's a parent-only item)
        const originalItem = items.find((i) => i.labelKey === item.labelKey)
        if (originalItem?.subItems && originalItem.subItems.length > 0) {
          return false // Remove if it was only a parent with no accessible children
        }
      }
      return true
    })
}
