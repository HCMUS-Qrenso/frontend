'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/src/i18n/navigation'
import type { Locale } from '@/src/i18n/config'
import { Button } from '@/src/components/ui/button'
import { Skeleton } from '@/src/components/ui/skeleton'
import { GeneralSettingsForm } from './general-settings-form'
import { TaxSettingsForm } from './tax-settings-form'
import { ServiceChargeForm } from './service-charge-form'
import { OrderSettingsForm } from './order-settings-form'
import { NotificationSettingsForm } from './notification-settings-form'
import { ReceiptSettingsForm } from './receipt-settings-form'
import { OperatingHoursForm } from './operating-hours-form'
import { useSettingsQuery, useUpdateSettingsMutation } from '../queries'
import { Save, Loader2 } from 'lucide-react'
import type { TenantSettings, UpdateTenantSettingsPayload } from '../types'

export function SettingsPage() {
  const t = useTranslations('settings')
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const { data: settingsData, isLoading, isError } = useSettingsQuery()
  const updateMutation = useUpdateSettingsMutation()

  const [formData, setFormData] = useState<TenantSettings | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Store original language to detect if it changed after save
  const originalLanguageRef = useRef<string | null>(null)

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settingsData?.data) {
      setFormData(settingsData.data)
      // Store original language on first load
      if (originalLanguageRef.current === null) {
        originalLanguageRef.current = settingsData.data.general.language
      }
    }
  }, [settingsData])

  const handleSave = useCallback(() => {
    if (!formData) return

    // Build payload with all changed fields
    const payload: UpdateTenantSettingsPayload = {
      // General
      currency: formData.general.currency,
      currencySymbol: formData.general.currency_symbol,
      timezone: formData.general.timezone,
      dateFormat: formData.general.date_format,
      language: formData.general.language,
      phone: formData.general.phone || undefined,
      contactEmail: formData.general.contact_email || undefined,
      // Tax
      taxRate: formData.tax.rate,
      taxInclusive: formData.tax.inclusive,
      taxLabel: formData.tax.label,
      // Service Charge
      serviceChargeEnabled: formData.service_charge.enabled,
      serviceChargeRate: formData.service_charge.rate,
      serviceChargeTaxable: formData.service_charge.taxable,
      serviceChargeMinParty: formData.service_charge.min_party || undefined,
      // Operating Hours
      operatingHours: formData.operating_hours || undefined,
      // Order
      minOrderValue: formData.order.min_value || undefined,
      estimatedPrepTime: formData.order.estimated_prep_time,
      allowSpecialInstructions: formData.order.allow_special_instructions,
      sessionTimeoutMinutes: formData.order.session_timeout_minutes,
      requireGuestCount: formData.order.require_guest_count,
      // Notifications
      notifySoundEnabled: formData.notifications.sound_enabled,
      notifyEmailEnabled: formData.notifications.email_enabled,
      notifyEmail: formData.notifications.email || undefined,
      // Receipt
      receiptHeader: formData.receipt.header || undefined,
      receiptFooter: formData.receipt.footer || undefined,
      receiptShowLogo: formData.receipt.show_logo,
      invoicePrefix: formData.receipt.invoice_prefix,
    }

    updateMutation.mutate(payload, {
      onSuccess: () => {
        setHasChanges(false)

        // If language changed, redirect to new locale URL
        const newLanguage = formData.general.language
        if (newLanguage !== currentLocale) {
          // Update original reference and redirect
          originalLanguageRef.current = newLanguage
          router.replace(pathname, { locale: newLanguage as Locale })
        }
      },
    })
  }, [formData, updateMutation, currentLocale, router, pathname])

  // Update form data helpers
  const updateGeneral = useCallback((partial: Partial<TenantSettings['general']>) => {
    setFormData((prev) => (prev ? { ...prev, general: { ...prev.general, ...partial } } : prev))
    setHasChanges(true)
  }, [])

  const updateTax = useCallback((partial: Partial<TenantSettings['tax']>) => {
    setFormData((prev) => (prev ? { ...prev, tax: { ...prev.tax, ...partial } } : prev))
    setHasChanges(true)
  }, [])

  const updateServiceCharge = useCallback((partial: Partial<TenantSettings['service_charge']>) => {
    setFormData((prev) =>
      prev ? { ...prev, service_charge: { ...prev.service_charge, ...partial } } : prev,
    )
    setHasChanges(true)
  }, [])

  const updateOrder = useCallback((partial: Partial<TenantSettings['order']>) => {
    setFormData((prev) => (prev ? { ...prev, order: { ...prev.order, ...partial } } : prev))
    setHasChanges(true)
  }, [])

  const updateNotifications = useCallback((partial: Partial<TenantSettings['notifications']>) => {
    setFormData((prev) =>
      prev ? { ...prev, notifications: { ...prev.notifications, ...partial } } : prev,
    )
    setHasChanges(true)
  }, [])

  const updateReceipt = useCallback((partial: Partial<TenantSettings['receipt']>) => {
    setFormData((prev) => (prev ? { ...prev, receipt: { ...prev.receipt, ...partial } } : prev))
    setHasChanges(true)
  }, [])

  const updateOperatingHours = useCallback((operatingHours: TenantSettings['operating_hours']) => {
    setFormData((prev) => (prev ? { ...prev, operating_hours: operatingHours } : prev))
    setHasChanges(true)
  }, [])

  if (isLoading) {
    return <SettingsPageSkeleton />
  }

  if (isError || !formData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">{t('loadError')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Save Button - Fixed at top right */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!hasChanges || updateMutation.isPending} size="lg">
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('saveChanges')}
            </>
          )}
        </Button>
      </div>

      {/* Grid Layout for Settings Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings - Full width on first row */}
        <div className="lg:col-span-2">
          <GeneralSettingsForm settings={formData.general} onChange={updateGeneral} />
        </div>

        {/* Tax Settings */}
        <TaxSettingsForm settings={formData.tax} onChange={updateTax} />

        {/* Service Charge */}
        <ServiceChargeForm settings={formData.service_charge} onChange={updateServiceCharge} />

        {/* Order Settings */}
        <OrderSettingsForm settings={formData.order} onChange={updateOrder} />

        {/* Operating Hours */}
        <OperatingHoursForm settings={formData.operating_hours} onChange={updateOperatingHours} />

        {/* Notifications */}
        <NotificationSettingsForm
          settings={formData.notifications}
          onChange={updateNotifications}
        />

        {/* Receipt - Full width */}
        <div className="lg:col-span-2">
          <ReceiptSettingsForm settings={formData.receipt} onChange={updateReceipt} />
        </div>
      </div>
    </div>
  )
}

/**
 * Loading skeleton for settings page - Grid layout
 */
function SettingsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Full width card */}
        <div className="rounded-xl border p-6 lg:col-span-2">
          <Skeleton className="mb-4 h-6 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* 2x2 cards */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border p-6">
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}

        {/* Full width card */}
        <div className="rounded-xl border p-6 lg:col-span-2">
          <Skeleton className="mb-4 h-6 w-40" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
