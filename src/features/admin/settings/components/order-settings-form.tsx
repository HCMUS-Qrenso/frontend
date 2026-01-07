'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import { SettingsSection } from './settings-section'
import { ShoppingBag } from 'lucide-react'
import type { OrderSettings } from '../types'

interface OrderSettingsFormProps {
  settings: OrderSettings
  onChange: (settings: Partial<OrderSettings>) => void
}

export function OrderSettingsForm({
  settings,
  onChange,
}: OrderSettingsFormProps) {
  const t = useTranslations('settings.order')

  return (
    <SettingsSection
      id="order"
      title={t('title')}
      description={t('description')}
      icon={ShoppingBag}
    >
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Min Order Value */}
          <div className="space-y-2">
            <Label htmlFor="minOrderValue">{t('minValue')}</Label>
            <Input
              id="minOrderValue"
              type="number"
              min={0}
              value={settings.min_value || ''}
              onChange={(e) =>
                onChange({
                  min_value: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder={t('minValuePlaceholder')}
            />
            <p className="text-xs text-muted-foreground">{t('minValueHint')}</p>
          </div>

          {/* Estimated Prep Time */}
          <div className="space-y-2">
            <Label htmlFor="prepTime">{t('prepTime')}</Label>
            <Input
              id="prepTime"
              type="number"
              min={1}
              max={180}
              value={settings.estimated_prep_time}
              onChange={(e) =>
                onChange({ estimated_prep_time: Number(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground">
              {t('prepTimeHint')}
            </p>
          </div>

          {/* Session Timeout */}
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">{t('sessionTimeout')}</Label>
            <Input
              id="sessionTimeout"
              type="number"
              min={15}
              max={480}
              value={settings.session_timeout_minutes}
              onChange={(e) =>
                onChange({ session_timeout_minutes: Number(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground">
              {t('sessionTimeoutHint')}
            </p>
          </div>
        </div>

        {/* Allow Special Instructions */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label>{t('allowSpecialInstructions')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('allowSpecialInstructionsDescription')}
            </p>
          </div>
          <Switch
            checked={settings.allow_special_instructions}
            onCheckedChange={(checked) =>
              onChange({ allow_special_instructions: checked })
            }
          />
        </div>

        {/* Require Guest Count */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label>{t('requireGuestCount')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('requireGuestCountDescription')}
            </p>
          </div>
          <Switch
            checked={settings.require_guest_count}
            onCheckedChange={(checked) =>
              onChange({ require_guest_count: checked })
            }
          />
        </div>
      </div>
    </SettingsSection>
  )
}

