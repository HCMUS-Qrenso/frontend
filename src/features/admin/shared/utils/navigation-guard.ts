/**
 * Role-based access control utilities for navigation
 */

import type { NavigationItem } from '../config/navigation.config'
import { hasRole } from '@/src/types/roles'

/**
 * Check if user has access to a navigation item
 */
export function canAccessNavigationItem(
  item: NavigationItem,
  userRole: string | undefined | null,
): boolean {
  if (!userRole) return false

  // If no allowedRoles specified, accessible to all authenticated users
  if (!item.allowedRoles) return true

  return hasRole(userRole, item.allowedRoles)
}

/**
 * Check if user can see a specific menu item (checks both parent and potentially sub-items)
 */
export function isMenuItemVisible(
  item: NavigationItem,
  userRole: string | undefined | null,
): boolean {
  if (!userRole) return false

  // Check parent access
  const hasParentAccess = canAccessNavigationItem(item, userRole)

  // If item has no sub-items, return parent access
  if (!item.subItems || item.subItems.length === 0) {
    return hasParentAccess
  }

  // If item has sub-items, check if user can access at least one sub-item
  const hasSubItemAccess = item.subItems.some((subItem) => {
    if (!subItem.allowedRoles) {
      // Sub-item inherits parent's allowedRoles
      return hasParentAccess
    }
    return hasRole(userRole, subItem.allowedRoles)
  })

  // Show parent item if user can access it directly or has access to any sub-item
  return hasParentAccess && hasSubItemAccess
}

/**
 * Get the count of visible navigation items for a user
 */
export function getVisibleNavigationCount(
  items: NavigationItem[],
  userRole: string | undefined | null,
): number {
  if (!userRole) return 0

  return items.filter((item) => isMenuItemVisible(item, userRole)).length
}

/**
 * Check if a specific route is accessible by a user role
 * Useful for route guards and redirects
 */
export function canAccessRoute(
  routePath: string,
  items: NavigationItem[],
  userRole: string | undefined | null,
): boolean {
  if (!userRole) return false

  for (const item of items) {
    // Check if route matches main item
    if (routePath === item.href || routePath.startsWith(item.href + '/')) {
      if (canAccessNavigationItem(item, userRole)) {
        return true
      }
    }

    // Check sub-items
    if (item.subItems) {
      for (const subItem of item.subItems) {
        if (routePath === subItem.href || routePath.startsWith(subItem.href + '/')) {
          if (!subItem.allowedRoles) {
            // Inherits from parent
            return canAccessNavigationItem(item, userRole)
          }
          return hasRole(userRole, subItem.allowedRoles)
        }
      }
    }
  }

  return false
}
