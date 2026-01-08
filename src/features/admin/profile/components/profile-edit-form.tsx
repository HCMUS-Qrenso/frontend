'use client'

import React, { useCallback, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { User } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import type { UserProfile, UpdateProfilePayload } from '../types'

interface ProfileEditFormProps {
  profile: UserProfile
  formData: Partial<UserProfile>
  setFormData: React.Dispatch<React.SetStateAction<Partial<UserProfile>>>
  setHasChanges: (hasChanges: boolean) => void
}

export function ProfileEditForm({
  profile,
  formData,
  setFormData,
  setHasChanges,
}: ProfileEditFormProps) {
  const t = useTranslations('profile')
  const originalDataRef = useRef<Partial<UserProfile>>({})

  // Store original data when profile changes
  useEffect(() => {
    originalDataRef.current = {
      fullName: profile.fullName,
      phone: profile.phone,
    }
  }, [profile])

  // Check if there are actual changes
  const checkForChanges = useCallback(() => {
    const original = originalDataRef.current
    const hasFullNameChanged = (formData.fullName || '') !== (original.fullName || '')
    const hasPhoneChanged = (formData.phone || '') !== (original.phone || '')
    return hasFullNameChanged || hasPhoneChanged
  }, [formData])

  // Update hasChanges whenever formData changes
  useEffect(() => {
    setHasChanges(checkForChanges())
  }, [checkForChanges, setHasChanges])

  const handleInputChange = useCallback(
    (field: keyof UpdateProfilePayload, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    [setFormData],
  )

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900/80',
      )}
    >
      <div className="mb-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <User className="h-5 w-5" />
          {t('personalInfo')}
        </h3>
      </div>
      <div className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">{t('fullName')}</Label>
          <Input
            id="fullName"
            value={formData.fullName || ''}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder={t('fullNamePlaceholder')}
          />
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input id="email" value={profile.email} disabled className="bg-muted" />
          <p className="text-muted-foreground text-xs">{t('emailNote')}</p>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">{t('phone')}</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder={t('phonePlaceholder')}
          />
        </div>
      </div>
    </div>
  )
}
