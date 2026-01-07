'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import { Textarea } from '@/src/components/ui/textarea'
import { SettingsSection } from './settings-section'
import { Receipt } from 'lucide-react'
import type { ReceiptSettings } from '../types'

interface ReceiptSettingsFormProps {
  settings: ReceiptSettings
  onChange: (settings: Partial<ReceiptSettings>) => void
}

export function ReceiptSettingsForm({
  settings,
  onChange,
}: ReceiptSettingsFormProps) {
  const t = useTranslations('settings.receipt')

  return (
    <SettingsSection
      id="receipt"
      title={t('title')}
      description={t('description')}
      icon={Receipt}
    >
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Invoice Prefix */}
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">{t('invoicePrefix')}</Label>
            <Input
              id="invoicePrefix"
              value={settings.invoice_prefix}
              onChange={(e) => onChange({ invoice_prefix: e.target.value })}
              placeholder={t('invoicePrefixPlaceholder')}
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">
              {t('invoicePrefixHint')}
            </p>
          </div>
        </div>

        {/* Header Text */}
        <div className="space-y-2">
          <Label htmlFor="receiptHeader">{t('header')}</Label>
          <Textarea
            id="receiptHeader"
            value={settings.header || ''}
            onChange={(e) => onChange({ header: e.target.value })}
            placeholder={t('headerPlaceholder')}
            rows={2}
            maxLength={500}
          />
        </div>

        {/* Footer Text */}
        <div className="space-y-2">
          <Label htmlFor="receiptFooter">{t('footer')}</Label>
          <Textarea
            id="receiptFooter"
            value={settings.footer || ''}
            onChange={(e) => onChange({ footer: e.target.value })}
            placeholder={t('footerPlaceholder')}
            rows={2}
            maxLength={500}
          />
        </div>

        {/* Show Logo */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label>{t('showLogo')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('showLogoDescription')}
            </p>
          </div>
          <Switch
            checked={settings.show_logo}
            onCheckedChange={(checked) => onChange({ show_logo: checked })}
          />
        </div>
      </div>
    </SettingsSection>
  )
}

