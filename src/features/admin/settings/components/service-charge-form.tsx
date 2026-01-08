'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import { SettingsSection } from './settings-section'
import { HandCoins } from 'lucide-react'
import type { ServiceChargeSettings } from '../types'

interface ServiceChargeFormProps {
  settings: ServiceChargeSettings
  onChange: (settings: Partial<ServiceChargeSettings>) => void
}

export function ServiceChargeForm({ settings, onChange }: ServiceChargeFormProps) {
  const t = useTranslations('settings.serviceCharge')

  return (
    <SettingsSection
      id="service-charge"
      title={t('title')}
      description={t('description')}
      icon={HandCoins}
    >
      <div className="space-y-6">
        {/* Enable Service Charge */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label>{t('enabled')}</Label>
            <p className="text-muted-foreground text-sm">{t('enabledDescription')}</p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => onChange({ enabled: checked })}
          />
        </div>

        {settings.enabled && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Rate */}
              <div className="space-y-2">
                <Label htmlFor="serviceChargeRate">{t('rate')}</Label>
                <div className="relative">
                  <Input
                    id="serviceChargeRate"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={settings.rate}
                    onChange={(e) => onChange({ rate: Number(e.target.value) })}
                    className="pr-8"
                  />
                  <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2">
                    %
                  </span>
                </div>
              </div>

              {/* Min Party Size */}
              <div className="space-y-2">
                <Label htmlFor="minParty">{t('minParty')}</Label>
                <Input
                  id="minParty"
                  type="number"
                  min={1}
                  value={settings.min_party || ''}
                  onChange={(e) =>
                    onChange({
                      min_party: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder={t('minPartyPlaceholder')}
                />
                <p className="text-muted-foreground text-xs">{t('minPartyHint')}</p>
              </div>
            </div>

            {/* Taxable */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>{t('taxable')}</Label>
                <p className="text-muted-foreground text-sm">{t('taxableDescription')}</p>
              </div>
              <Switch
                checked={settings.taxable}
                onCheckedChange={(checked) => onChange({ taxable: checked })}
              />
            </div>
          </>
        )}
      </div>
    </SettingsSection>
  )
}
