import { useTenantSettings } from '@/src/contexts/tenant-settings-context'
import { TenantSettings } from '../settings'

// Helper function to get initials from full name
export const getInitials = (fullName: string): string => {
  const names = fullName.trim().split(/\s+/)
  if (names.length === 0) return ''
  if (names.length === 1) return names[0].charAt(0).toUpperCase()
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
}

// Helper function to map role to Vietnamese label
export const getRoleLabel = (role: string): string => {
  const roleMap: Record<string, string> = {
    owner: 'Chủ nhà hàng',
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    waiter: 'Nhân viên phục vụ',
    chef: 'Đầu bếp',
    customer: 'Khách hàng',
  }
  return roleMap[role.toLowerCase()] || role
}

export const NOTIFICATION_SOUNDS = [
  { id: 1, name: 'Bell', description: 'Classic bell notification', file: 'bell.mp3' },
  { id: 2, name: 'Chime', description: 'Gentle chime sound', file: 'chime.mp3' },
  { id: 3, name: 'Ding', description: 'Quick ding notification', file: 'ding.mp3' },
  { id: 4, name: 'Pop', description: 'Modern pop sound', file: 'pop.mp3' },
  { id: 5, name: 'Ping', description: 'Sharp ping alert', file: 'ping.mp3' },
]

/**
 * Play notification sound for important events
 * @param soundId Optional sound ID to play (uses settings sound if not provided)
 * @param settings Settings object (required)
 * @param forcePlay If true, plays sound regardless of sound_enabled setting (for preview)
 */
export function playNotificationSound(
  settings: TenantSettings,
  soundId?: number,
  forcePlay = false,
) {
  // Check settings for actual notifications (not for preview)
  if (!forcePlay && !settings.notifications.sound_enabled) return

  // Use provided soundId or get from settings
  const targetSoundId = soundId ?? settings.notifications.sound ?? 1

  const sound = NOTIFICATION_SOUNDS.find((s) => s.id === targetSoundId)
  if (!sound) return

  try {
    const audio = new Audio(`/sounds/notification/${sound.file}`)
    audio.volume = 0.5
    audio.play().catch((err) => {
      console.warn('[AdminSocket] Could not play notification sound:', err)
    })
  } catch (err) {
    console.warn('[AdminSocket] Error creating audio:', err)
  }
}
