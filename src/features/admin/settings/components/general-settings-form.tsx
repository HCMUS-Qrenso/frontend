'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { SettingsSection } from './settings-section'
import { Building2 } from 'lucide-react'
import type { GeneralSettings } from '../types'

interface GeneralSettingsFormProps {
  settings: GeneralSettings
  onChange: (settings: Partial<GeneralSettings>) => void
}

const CURRENCIES = [
  { value: 'VND', label: 'VND - Việt Nam Đồng', symbol: '₫' },
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'CNY', label: 'CNY - 人民币', symbol: '¥' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
]

const TIMEZONES = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam (GMT+7)' },
  { value: 'America/New_York', label: 'New York (GMT-5/-4)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (GMT+8)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1/+2)' },
]

const LANGUAGES = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'fr', label: 'Français' },
]

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

export function GeneralSettingsForm({
  settings,
  onChange,
}: GeneralSettingsFormProps) {
  const t = useTranslations('settings.general')

  return (
    <SettingsSection
      id="general"
      title={t('title')}
      description={t('description')}
      icon={Building2}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency">{t('currency')}</Label>
          <Select
            value={settings.currency}
            onValueChange={(value) => {
              const currency = CURRENCIES.find((c) => c.value === value)
              onChange({
                currency: value,
                currency_symbol: currency?.symbol || '₫',
              })
            }}
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder={t('currencyPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label htmlFor="timezone">{t('timezone')}</Label>
          <Select
            value={settings.timezone}
            onValueChange={(value) => onChange({ timezone: value })}
          >
            <SelectTrigger id="timezone">
              <SelectValue placeholder={t('timezonePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language">{t('language')}</Label>
          <Select
            value={settings.language}
            onValueChange={(value) => onChange({ language: value })}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder={t('languagePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Format */}
        <div className="space-y-2">
          <Label htmlFor="dateFormat">{t('dateFormat')}</Label>
          <Select
            value={settings.date_format}
            onValueChange={(value) => onChange({ date_format: value })}
          >
            <SelectTrigger id="dateFormat">
              <SelectValue placeholder={t('dateFormatPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">{t('phone')}</Label>
          <Input
            id="phone"
            type="tel"
            value={settings.phone || ''}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder={t('phonePlaceholder')}
          />
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <Label htmlFor="contactEmail">{t('contactEmail')}</Label>
          <Input
            id="contactEmail"
            type="email"
            value={settings.contact_email || ''}
            onChange={(e) => onChange({ contact_email: e.target.value })}
            placeholder={t('contactEmailPlaceholder')}
          />
        </div>
      </div>
    </SettingsSection>
  )
}

