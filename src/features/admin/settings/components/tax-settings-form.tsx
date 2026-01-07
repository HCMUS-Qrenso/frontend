'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import { SettingsSection } from './settings-section'
import { Percent } from 'lucide-react'
import type { TaxSettings } from '../types'

interface TaxSettingsFormProps {
  settings: TaxSettings
  onChange: (settings: Partial<TaxSettings>) => void
}

export function TaxSettingsForm({ settings, onChange }: TaxSettingsFormProps) {
  const t = useTranslations('settings.tax')

  return (
    <SettingsSection
      id="tax"
      title={t('title')}
      description={t('description')}
      icon={Percent}
    >
      <div className="space-y-6">
        {/* Tax Rate */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="taxRate">{t('rate')}</Label>
            <div className="relative">
              <Input
                id="taxRate"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={settings.rate}
                onChange={(e) => onChange({ rate: Number(e.target.value) })}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxLabel">{t('label')}</Label>
            <Input
              id="taxLabel"
              value={settings.label}
              onChange={(e) => onChange({ label: e.target.value })}
              placeholder={t('labelPlaceholder')}
            />
          </div>
        </div>

        {/* Tax Inclusive */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label>{t('inclusive')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('inclusiveDescription')}
            </p>
          </div>
          <Switch
            checked={settings.inclusive}
            onCheckedChange={(checked) => onChange({ inclusive: checked })}
          />
        </div>
      </div>
    </SettingsSection>
  )
}

