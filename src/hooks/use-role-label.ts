/**
 * Hook for getting localized role labels
 * Replaces the utility function with proper i18n support
 */

import { useTranslations } from 'next-intl'

export function useRoleLabel() {
  const t = useTranslations('admin.roles')

  return (role: string): string => {
    // Map role values to translation keys
    const roleKeyMap: Record<string, string> = {
      owner: 'owner',
      admin: 'admin',
      waiter: 'waiter',
      kitchen_staff: 'kitchen_staff',
      super_admin: 'super_admin',
    }

    const key = roleKeyMap[role.toLowerCase()]
    if (key) {
      return t(key)
    }

    // Fallback to the original role string if no translation found
    return role
  }
}
