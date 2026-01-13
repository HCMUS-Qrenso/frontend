/**
 * Role definitions and constants for admin management system
 * Matches backend ROLES from backend/src/common/constants/auth.constants.ts
 * Note: Guest and customer roles are excluded as they're for customer-facing frontend only
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  ADMIN: 'admin',
  WAITER: 'waiter',
  KITCHEN: 'kitchen_staff',
} as const

export type UserRole = (typeof ROLES)[keyof typeof ROLES]

/**
 * Check if a role has access to a specific permission
 */
export function hasRole(userRole: string | undefined | null, allowedRoles: string[]): boolean {
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}

/**
 * Role hierarchy helper - checks if user has role or higher privilege
 */
export function hasRoleOrHigher(userRole: string | undefined | null, minimumRole: string): boolean {
  if (!userRole) return false

  // Define role hierarchy for admin staff (higher index = higher privilege)
  const roleHierarchy: string[] = [
    ROLES.KITCHEN,
    ROLES.WAITER,
    ROLES.ADMIN,
    ROLES.OWNER,
    ROLES.SUPER_ADMIN,
  ]

  const userRoleIndex = roleHierarchy.indexOf(userRole)
  const minimumRoleIndex = roleHierarchy.indexOf(minimumRole)

  if (userRoleIndex === -1 || minimumRoleIndex === -1) return false

  return userRoleIndex >= minimumRoleIndex
}
