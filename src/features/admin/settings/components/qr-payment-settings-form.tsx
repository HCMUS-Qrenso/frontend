'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { SettingsSection } from './settings-section'
import { Button } from '@/src/components/ui/button'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { QrCode, Eye, EyeOff, AlertTriangle, Download } from 'lucide-react'
import type { QrPaymentSettings } from '../types'

interface QrPaymentSettingsFormProps {
  settings: QrPaymentSettings
  onChange: (settings: Partial<QrPaymentSettings>) => void
}

export function QrPaymentSettingsForm({ settings, onChange }: QrPaymentSettingsFormProps) {
  const t = useTranslations('settings.qrPayment')

  // Visibility states for password fields
  const [showClientId, setShowClientId] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showChecksumKey, setShowChecksumKey] = useState(false)

  return (
    <SettingsSection
      id="qr-payment"
      title={t('title')}
      description={t('description')}
      icon={QrCode}
    >
      <div className="space-y-6">
        {/* Warning Alert */}
        <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{t('warningMessage')}</AlertDescription>
        </Alert>

        {/* Download Instructions Button */}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              // Download PayOS setup instructions PDF
              const link = document.createElement('a')
              link.href = '/s3-storage/docs/payos-setup.pdf'
              link.download = 'payos-setup-instructions.pdf'
              link.target = '_blank'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
          >
            <Download className="h-4 w-4" />
            {t('downloadInstructions')}
          </Button>
        </div>
        {/* PayOS Client ID */}
        <div className="space-y-2">
          <Label htmlFor="payosClientId">{t('clientId')}</Label>
          <div className="relative">
            <Input
              id="payosClientId"
              type={showClientId ? 'text' : 'password'}
              value={settings.payos_client_id || ''}
              onChange={(e) => onChange({ payos_client_id: e.target.value || null })}
              placeholder={t('clientIdPlaceholder')}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 h-full px-0 py-0 hover:bg-transparent"
              onClick={() => setShowClientId(!showClientId)}
            >
              {showClientId ? (
                <EyeOff className="text-muted-foreground h-4 w-4" />
              ) : (
                <Eye className="text-muted-foreground h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">{t('clientIdDescription')}</p>
        </div>

        {/* PayOS API Key */}
        <div className="space-y-2">
          <Label htmlFor="payosApiKey">{t('apiKey')}</Label>
          <div className="relative">
            <Input
              id="payosApiKey"
              type={showApiKey ? 'text' : 'password'}
              value={settings.payos_api_key || ''}
              onChange={(e) => onChange({ payos_api_key: e.target.value || null })}
              placeholder={t('apiKeyPlaceholder')}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 h-full px-0 py-0 hover:bg-transparent"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <EyeOff className="text-muted-foreground h-4 w-4" />
              ) : (
                <Eye className="text-muted-foreground h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">{t('apiKeyDescription')}</p>
        </div>

        {/* PayOS Checksum Key */}
        <div className="space-y-2">
          <Label htmlFor="payosChecksumKey">{t('checksumKey')}</Label>
          <div className="relative">
            <Input
              id="payosChecksumKey"
              type={showChecksumKey ? 'text' : 'password'}
              value={settings.payos_checksum_key || ''}
              onChange={(e) => onChange({ payos_checksum_key: e.target.value || null })}
              placeholder={t('checksumKeyPlaceholder')}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 h-full px-0 py-0 hover:bg-transparent"
              onClick={() => setShowChecksumKey(!showChecksumKey)}
            >
              {showChecksumKey ? (
                <EyeOff className="text-muted-foreground h-4 w-4" />
              ) : (
                <Eye className="text-muted-foreground h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">{t('checksumKeyDescription')}</p>
        </div>
      </div>
    </SettingsSection>
  )
}
