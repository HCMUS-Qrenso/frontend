'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import { SettingsSection } from './settings-section'
import { Bell } from 'lucide-react'
import type { NotificationSettings } from '../types'

interface NotificationSettingsFormProps {
  settings: NotificationSettings
  onChange: (settings: Partial<NotificationSettings>) => void
}

export function NotificationSettingsForm({
  settings,
  onChange,
}: NotificationSettingsFormProps) {
  const t = useTranslations('settings.notifications')

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
            <p className="text-sm text-muted-foreground">
              {t('soundDescription')}
            </p>
          </div>
          <Switch
            checked={settings.sound_enabled}
            onCheckedChange={(checked) => onChange({ sound_enabled: checked })}
          />
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between rounded-lg border p-4 opacity-60">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label>{t('emailEnabled')}</Label>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('emailDescription')}
            </p>
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

