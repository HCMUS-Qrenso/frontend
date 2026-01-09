'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group'
import { SettingsSection } from './settings-section'
import { Bell, Volume2 } from 'lucide-react'
import type { NotificationSettings } from '../types'
import { playNotificationSound } from '../../shared/utils'
import { useTenantSettings } from '@/src/contexts/tenant-settings-context'

interface NotificationSettingsFormProps {
  settings: NotificationSettings
  onChange: (settings: Partial<NotificationSettings>) => void
}

export function NotificationSettingsForm({ settings, onChange }: NotificationSettingsFormProps) {
  const t = useTranslations('settings.notifications')
  const { settings: tenantSettings } = useTenantSettings()

  const getSoundInfo = (soundId: number) => {
    const soundKeys = ['bell', 'chime', 'ding', 'pop', 'ping'] as const
    const soundKey = soundKeys[soundId - 1] // Convert 1-based ID to 0-based array index
    return {
      name: t(`sounds.${soundKey}.name`),
      description: t(`sounds.${soundKey}.description`),
    }
  }

  return (
    <SettingsSection
      id="notifications"
      title={t('title')}
      description={t('description')}
      icon={Bell}
    >
      <div className="space-y-6">
        {/* Sound Notifications */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label>{t('soundEnabled')}</Label>
            <p className="text-muted-foreground text-sm">{t('soundDescription')}</p>
          </div>
          <Switch
            checked={settings.sound_enabled}
            onCheckedChange={(checked) => onChange({ sound_enabled: checked })}
          />
        </div>

        {/* Sound Selection */}
        {settings.sound_enabled && (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Volume2 className="text-muted-foreground h-4 w-4" />
              <Label>{t('soundType')}</Label>
            </div>
            <RadioGroup
              value={String(settings.sound || 1)}
              onValueChange={(value) => onChange({ sound: Number(value) })}
              className="space-y-3"
            >
              {[1, 2, 3, 4, 5].map((soundId) => {
                const soundInfo = getSoundInfo(soundId)
                return (
                  <div key={soundId} className="flex items-center space-x-3">
                    <RadioGroupItem value={String(soundId)} id={`sound-${soundId}`} />
                    <Label
                      htmlFor={`sound-${soundId}`}
                      className="flex-1 cursor-pointer font-normal"
                      onClick={() => playNotificationSound(tenantSettings, soundId, true)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{soundInfo.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {soundInfo.description}
                        </span>
                      </div>
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>
        )}

        {/* Email Notifications */}
        <div className="flex items-center justify-between rounded-lg border p-4 opacity-60">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label>{t('emailEnabled')}</Label>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                Coming Soon
              </span>
            </div>
            <p className="text-muted-foreground text-sm">{t('emailDescription')}</p>
          </div>
          <Switch
            checked={settings.email_enabled}
            onCheckedChange={(checked) => onChange({ email_enabled: checked })}
            disabled
          />
        </div>

        {settings.email_enabled && (
          <div className="space-y-2">
            <Label htmlFor="notifyEmail">{t('email')}</Label>
            <Input
              id="notifyEmail"
              type="email"
              value={settings.email || ''}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder={t('emailPlaceholder')}
            />
          </div>
        )}
      </div>
    </SettingsSection>
  )
}
